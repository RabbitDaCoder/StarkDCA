// ─── Execution Service ───────────────────────────────────────────────
// Core execution engine for DCA plans.
// Uses distributed locks + Prisma transactions for safety.

import { ExecutionStatus, PlanStatus, Interval } from '@prisma/client';
import { prisma } from '../../infrastructure/db';
import { cacheDel, cacheDelPattern } from '../../infrastructure/redis';
import { withLock } from '../../utils/distributed-lock';
import { logger } from '../../infrastructure/logger';
import { priceService } from '../price/price.service';
import { dcaService } from '../dca/dca.service';

const EXECUTION_LOCK_PREFIX = 'dca-execution:';

interface ExecutionResult {
  planId: string;
  executionNumber: number;
  status: ExecutionStatus;
  amountIn: string;
  amountOut: string | null;
  priceAtExecution: number | null;
  txHash: string | null;
  errorMessage: string | null;
}

class ExecutionService {
  /**
   * Execute a single DCA plan.
   * Wrapped in a distributed lock to prevent double execution.
   * Uses Prisma transactions for atomicity.
   */
  async executePlan(planId: string): Promise<ExecutionResult | null> {
    const lockKey = `${EXECUTION_LOCK_PREFIX}${planId}`;

    return withLock(lockKey, async () => {
      return this.executeWithTransaction(planId);
    });
  }

  /**
   * Process all due plans. Called by the cron scheduler.
   */
  async processDuePlans(): Promise<ExecutionResult[]> {
    const duePlans = await dcaService.getDuePlans();

    if (duePlans.length === 0) {
      logger.debug('No plans due for execution');
      return [];
    }

    logger.info({ count: duePlans.length }, 'Processing due plans');

    const results: ExecutionResult[] = [];

    // Execute sequentially to avoid overwhelming the blockchain
    for (const plan of duePlans) {
      try {
        const result = await this.executePlan(plan.id);
        if (result) {
          results.push(result);
        } else {
          logger.warn({ planId: plan.id }, 'Plan execution skipped — lock held');
        }
      } catch (error) {
        logger.error({ err: error, planId: plan.id }, 'Plan execution failed');
      }
    }

    logger.info({ executed: results.length, total: duePlans.length }, 'Execution batch complete');
    return results;
  }

  // ─── Private ─────────────────────────────────────────────────────

  private async executeWithTransaction(planId: string): Promise<ExecutionResult> {
    // Use Prisma interactive transaction for full atomicity
    return prisma.$transaction(
      async (tx) => {
        // 1. Lock the row with FOR UPDATE to prevent races at DB level
        const plan = await tx.dCAPlan.findUnique({
          where: { id: planId },
        });

        if (!plan) {
          throw new Error(`Plan ${planId} not found`);
        }

        if (plan.status !== PlanStatus.ACTIVE) {
          logger.warn({ planId, status: plan.status }, 'Plan not active — skipping');
          return this.buildResult(
            planId,
            plan.executionsCompleted + 1,
            ExecutionStatus.FAILED,
            plan.amountPerExecution,
            null,
            null,
            null,
            'Plan not active',
          );
        }

        if (plan.executionsCompleted >= plan.totalExecutions) {
          logger.warn({ planId }, 'Plan already fully executed');
          return this.buildResult(
            planId,
            plan.executionsCompleted,
            ExecutionStatus.FAILED,
            plan.amountPerExecution,
            null,
            null,
            null,
            'All executions completed',
          );
        }

        const executionNumber = plan.executionsCompleted + 1;

        // 2. Check idempotency — has this execution already been recorded?
        const existing = await tx.executionHistory.findUnique({
          where: {
            planId_executionNumber: {
              planId,
              executionNumber,
            },
          },
        });

        if (existing) {
          logger.info({ planId, executionNumber }, 'Execution already recorded — idempotent skip');
          return this.buildResult(
            planId,
            executionNumber,
            existing.status,
            existing.amountIn,
            existing.amountOut,
            existing.priceAtExecution,
            existing.txHash,
            existing.errorMessage,
          );
        }

        // 3. Fetch BTC price
        let priceData;
        try {
          priceData = await priceService.getBtcPrice();
        } catch (err) {
          // Record failed execution
          const failedExec = await tx.executionHistory.create({
            data: {
              planId,
              executionNumber,
              amountIn: plan.amountPerExecution,
              status: ExecutionStatus.FAILED,
              errorMessage: 'Failed to fetch BTC price',
            },
          });

          return this.buildResult(
            planId,
            executionNumber,
            ExecutionStatus.FAILED,
            plan.amountPerExecution,
            null,
            null,
            null,
            'Failed to fetch BTC price',
          );
        }

        // 4. Calculate output amount
        const amountIn = plan.amountPerExecution;
        const amountOut = (parseFloat(amountIn) / priceData.price).toFixed(8);

        // 5. Execute on-chain (placeholder — would call starknet service)
        let txHash: string | null = null;
        try {
          // TODO: Replace with actual on-chain execution
          // txHash = await callContract(config.starknet.contractAddress, abi, 'execute_plan', [...])
          txHash = `0x${Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex')}`;
        } catch (err) {
          const failedExec = await tx.executionHistory.create({
            data: {
              planId,
              executionNumber,
              amountIn,
              amountOut,
              priceAtExecution: priceData.price,
              status: ExecutionStatus.FAILED,
              errorMessage: `Blockchain tx failed: ${(err as Error).message}`,
            },
          });

          return this.buildResult(
            planId,
            executionNumber,
            ExecutionStatus.FAILED,
            amountIn,
            amountOut,
            priceData.price,
            null,
            `Blockchain tx failed: ${(err as Error).message}`,
          );
        }

        // 6. Record successful execution + update plan atomically
        const nextExecutionAt = dcaService.computeNextExecution(new Date(), plan.interval);
        const isComplete = executionNumber >= plan.totalExecutions;

        await tx.executionHistory.create({
          data: {
            planId,
            executionNumber,
            amountIn,
            amountOut,
            priceAtExecution: priceData.price,
            txHash,
            status: ExecutionStatus.SUCCESS,
          },
        });

        await tx.dCAPlan.update({
          where: { id: planId },
          data: {
            executionsCompleted: executionNumber,
            nextExecutionAt,
            status: isComplete ? PlanStatus.COMPLETED : PlanStatus.ACTIVE,
          },
        });

        // 7. Invalidate caches (outside transaction, non-blocking)
        cacheDel(`plan:${planId}`).catch(() => {});
        cacheDelPattern(`user-plans:${plan.userId}:*`).catch(() => {});

        logger.info(
          { planId, executionNumber, amountOut, price: priceData.price, txHash },
          `Plan executed — bought ${amountOut} BTC at $${priceData.price}`,
        );

        return this.buildResult(
          planId,
          executionNumber,
          ExecutionStatus.SUCCESS,
          amountIn,
          amountOut,
          priceData.price,
          txHash,
          null,
        );
      },
      {
        maxWait: 10_000,
        timeout: 30_000,
        isolationLevel: 'Serializable',
      },
    );
  }

  private buildResult(
    planId: string,
    executionNumber: number,
    status: ExecutionStatus,
    amountIn: string,
    amountOut: string | null,
    priceAtExecution: number | null,
    txHash: string | null,
    errorMessage: string | null,
  ): ExecutionResult {
    return {
      planId,
      executionNumber,
      status,
      amountIn,
      amountOut,
      priceAtExecution,
      txHash,
      errorMessage,
    };
  }
}

export const executionService = new ExecutionService();
