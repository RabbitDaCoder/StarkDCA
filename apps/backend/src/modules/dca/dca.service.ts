// ─── DCA Service ─────────────────────────────────────────────────────
// Business logic for DCA plan CRUD. Database-backed via Prisma.
// Uses Redis caching for reads, cache invalidation on writes.

import { Prisma, PlanStatus, Interval } from '@prisma/client';
import { prisma } from '../../infrastructure/db';
import { cacheGet, cacheSet, cacheDelPattern } from '../../infrastructure/redis';
import { config } from '../../config';
import { logger } from '../../infrastructure/logger';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../../utils/errors';
import {
  parsePaginationParams,
  buildPrismaPage,
  formatPaginatedResult,
  PaginatedResult,
} from '../../utils/pagination';
import type { CreatePlanInput } from './dca.schema';
import { emailService } from '../../infrastructure/email';
import { prisma as prismaClient } from '../../infrastructure/db';

// ─── Cache Keys ──────────────────────────────────────────────────────
const planCacheKey = (id: string) => `plan:${id}`;
const userPlansPattern = (userId: string) => `user-plans:${userId}:*`;

class DcaService {
  /**
   * Create a new DCA plan inside a transaction.
   * Calculates total deposit, sets first execution time.
   */
  async createPlan(userId: string, input: CreatePlanInput) {
    const totalDeposited = (
      BigInt(input.amountPerExecution) * BigInt(input.totalExecutions)
    ).toString();

    const nextExecutionAt = this.computeNextExecution(new Date(), input.interval as Interval);

    const plan = await prisma.dCAPlan.create({
      data: {
        userId,
        depositTokenAddress: input.depositTokenAddress,
        targetTokenAddress: input.targetTokenAddress,
        amountPerExecution: input.amountPerExecution,
        totalDeposited,
        totalExecutions: input.totalExecutions,
        interval: input.interval as Interval,
        nextExecutionAt,
      },
      include: {
        executions: true,
      },
    });

    // Invalidate user's plan list cache
    await cacheDelPattern(userPlansPattern(userId));

    logger.info({ planId: plan.id, userId }, 'DCA plan created');

    // Send plan-activated email (non-blocking)
    this.sendPlanActivatedEmail(userId, plan).catch((err) =>
      logger.error({ err, planId: plan.id }, 'Failed to send plan-activated email'),
    );

    return plan;
  }

  /**
   * Cancel an active plan. Only the owner can cancel.
   */
  async cancelPlan(planId: string, userId: string) {
    const plan = await prisma.dCAPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) throw new NotFoundError('Plan not found');
    if (plan.userId !== userId) throw new ForbiddenError('Not plan owner');
    if (plan.status === PlanStatus.CANCELLED) throw new ConflictError('Plan already cancelled');
    if (plan.status === PlanStatus.COMPLETED)
      throw new BadRequestError('Cannot cancel a completed plan');

    const updated = await prisma.dCAPlan.update({
      where: { id: planId },
      data: { status: PlanStatus.CANCELLED },
      include: { executions: true },
    });

    // Invalidate caches
    const { cacheDel } = await import('../../infrastructure/redis');
    await cacheDel(planCacheKey(planId));
    await cacheDelPattern(userPlansPattern(userId));

    logger.info({ planId }, 'DCA plan cancelled');

    // Send plan-cancelled email (non-blocking)
    this.sendPlanCancelledEmail(userId, updated).catch((err) =>
      logger.error({ err, planId }, 'Failed to send plan-cancelled email'),
    );

    return updated;
  }

  /**
   * Get a single plan by ID. Cached in Redis.
   */
  async getPlanById(planId: string, userId: string) {
    // Try cache
    const cached = await cacheGet<any>(planCacheKey(planId));
    if (cached) {
      if (cached.userId !== userId) throw new ForbiddenError('Not plan owner');
      return cached;
    }

    const plan = await prisma.dCAPlan.findUnique({
      where: { id: planId },
      include: {
        executions: {
          orderBy: { executionNumber: 'desc' },
          take: 10,
        },
      },
    });

    if (!plan) throw new NotFoundError('Plan not found');
    if (plan.userId !== userId) throw new ForbiddenError('Not plan owner');

    // Cache
    await cacheSet(planCacheKey(planId), plan, config.cache.planTtl);

    return plan;
  }

  /**
   * List plans for a user with cursor-based pagination.
   * Supports optional status filter.
   */
  async listPlans(
    userId: string,
    query: { cursor?: string; limit?: string; status?: string },
  ): Promise<PaginatedResult<any>> {
    const pagination = parsePaginationParams(query);
    const pageQuery = buildPrismaPage(pagination);

    const where: Prisma.DCAPlanWhereInput = {
      userId,
      ...(query.status ? { status: query.status as PlanStatus } : {}),
    };

    const plans = await prisma.dCAPlan.findMany({
      where,
      ...pageQuery,
      include: {
        executions: {
          orderBy: { executionNumber: 'desc' },
          take: 1, // Only latest execution for list view (avoid N+1)
        },
        _count: {
          select: { executions: true },
        },
      },
    });

    return formatPaginatedResult(plans, pagination.limit);
  }

  /**
   * Get execution history for a plan with cursor-based pagination.
   */
  async getExecutionHistory(
    planId: string,
    userId: string,
    query: { cursor?: string; limit?: string },
  ): Promise<PaginatedResult<any>> {
    // Verify ownership
    const plan = await prisma.dCAPlan.findUnique({
      where: { id: planId },
      select: { userId: true },
    });

    if (!plan) throw new NotFoundError('Plan not found');
    if (plan.userId !== userId) throw new ForbiddenError('Not plan owner');

    const pagination = parsePaginationParams(query);

    const executions = await prisma.executionHistory.findMany({
      where: { planId },
      take: pagination.limit + 1,
      ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { executedAt: 'desc' },
    });

    return formatPaginatedResult(executions, pagination.limit);
  }

  // ─── Internal (used by execution module) ─────────────────────────

  /**
   * Get all plans that are due for execution.
   * Used by the cron scheduler. No caching — always fresh from DB.
   */
  async getExecutablePlans() {
    return prisma.dCAPlan.findMany({
      where: {
        status: PlanStatus.ACTIVE,
        nextExecutionAt: { lte: new Date() },
        executionsCompleted: {
          lt: prisma.dCAPlan.fields.totalExecutions as unknown as number,
        },
      },
      // Prisma doesn't support field-to-field comparison directly,
      // so we use a raw filter below
    });
  }

  /**
   * Get due plans using raw SQL for field-to-field comparison.
   */
  async getDuePlans() {
    return prisma.$queryRaw<
      Array<{
        id: string;
        user_id: string;
        amount_per_execution: string;
        total_executions: number;
        executions_completed: number;
        interval: string;
        on_chain_plan_id: string | null;
      }>
    >`
      SELECT id, user_id, amount_per_execution, total_executions,
             executions_completed, interval, on_chain_plan_id
      FROM dca_plans
      WHERE status = 'ACTIVE'
        AND next_execution_at <= NOW()
        AND executions_completed < total_executions
      ORDER BY next_execution_at ASC
      LIMIT 100
    `;
  }

  computeNextExecution(from: Date, interval: Interval): Date {
    const ms: Record<Interval, number> = {
      DAILY: 86_400_000,
      WEEKLY: 604_800_000,
      BIWEEKLY: 1_209_600_000,
      MONTHLY: 2_592_000_000,
    };
    return new Date(from.getTime() + ms[interval]);
  }

  // ─── Portfolio Summary ───────────────────────────────────────────

  /**
   * Get portfolio-level stats for a user.
   */
  async getPortfolioSummary(userId: string) {
    // Aggregate plan totals
    const planStats = await prisma.$queryRaw<
      Array<{
        active_plans: string;
        total_plans: string;
        total_deposited: string;
      }>
    >`
      SELECT
        COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active_plans,
        COUNT(*) AS total_plans,
        COALESCE(SUM(CAST(total_deposited AS NUMERIC)), 0) AS total_deposited
      FROM dca_plans
      WHERE user_id = ${userId}
    `;

    // Aggregate execution totals
    const execStats = await prisma.$queryRaw<
      Array<{
        total_executions: string;
        successful_executions: string;
        failed_executions: string;
        total_amount_in: string;
        total_amount_out: string;
        avg_price: string;
      }>
    >`
      SELECT
        COUNT(*) AS total_executions,
        COUNT(*) FILTER (WHERE eh.status = 'SUCCESS') AS successful_executions,
        COUNT(*) FILTER (WHERE eh.status = 'FAILED') AS failed_executions,
        COALESCE(SUM(CAST(eh.amount_in AS NUMERIC)) FILTER (WHERE eh.status = 'SUCCESS'), 0) AS total_amount_in,
        COALESCE(SUM(CAST(eh.amount_out AS NUMERIC)) FILTER (WHERE eh.status = 'SUCCESS'), 0) AS total_amount_out,
        COALESCE(AVG(eh.price_at_execution) FILTER (WHERE eh.status = 'SUCCESS'), 0) AS avg_price
      FROM execution_history eh
      JOIN dca_plans dp ON eh.plan_id = dp.id
      WHERE dp.user_id = ${userId}
    `;

    const ps = planStats[0] || {
      active_plans: '0',
      total_plans: '0',
      total_deposited: '0',
    };
    const es = execStats[0] || {
      total_executions: '0',
      successful_executions: '0',
      failed_executions: '0',
      total_amount_in: '0',
      total_amount_out: '0',
      avg_price: '0',
    };

    // Next execution time
    const nextPlan = await prisma.dCAPlan.findFirst({
      where: { userId, status: PlanStatus.ACTIVE },
      orderBy: { nextExecutionAt: 'asc' },
      select: { nextExecutionAt: true },
    });

    return {
      activePlans: parseInt(String(ps.active_plans)),
      totalPlans: parseInt(String(ps.total_plans)),
      totalDeposited: parseFloat(String(ps.total_deposited)),
      totalInvested: parseFloat(String(es.total_amount_in)),
      btcAccumulated: parseFloat(parseFloat(String(es.total_amount_out)).toFixed(8)),
      avgEntryPrice: parseFloat(parseFloat(String(es.avg_price)).toFixed(2)),
      totalExecutions: parseInt(String(es.total_executions)),
      successfulExecutions: parseInt(String(es.successful_executions)),
      failedExecutions: parseInt(String(es.failed_executions)),
      nextExecutionAt: nextPlan?.nextExecutionAt?.getTime() || null,
    };
  }

  /**
   * Get all execution history for a user across all plans.
   */
  async getAllExecutions(
    userId: string,
    query: { cursor?: string; limit?: string },
  ): Promise<PaginatedResult<any>> {
    const pagination = parsePaginationParams(query);

    const executions = await prisma.executionHistory.findMany({
      where: {
        plan: { userId },
      },
      take: pagination.limit + 1,
      ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { executedAt: 'desc' },
      include: {
        plan: {
          select: {
            amountPerExecution: true,
            interval: true,
            targetTokenAddress: true,
          },
        },
      },
    });

    return formatPaginatedResult(executions, pagination.limit);
  }

  // ─── Private email helpers ───────────────────────────────────────

  private async sendPlanActivatedEmail(userId: string, plan: any): Promise<void> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;

    const intervalMap: Record<string, string> = {
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      BIWEEKLY: 'Biweekly',
      MONTHLY: 'Monthly',
    };

    await emailService.sendPlanActivatedEmail(user.email, user.name || 'there', {
      amount: plan.amountPerExecution,
      interval: intervalMap[plan.interval] || plan.interval,
      totalExecutions: plan.totalExecutions,
      totalDeposit: plan.totalDeposited,
    });
  }

  private async sendPlanCancelledEmail(userId: string, plan: any): Promise<void> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;

    const intervalMap: Record<string, string> = {
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      BIWEEKLY: 'Biweekly',
      MONTHLY: 'Monthly',
    };

    await emailService.sendPlanCancelledEmail(user.email, user.name || 'there', {
      amount: plan.amountPerExecution,
      interval: intervalMap[plan.interval] || plan.interval,
      executionsCompleted: plan.executionsCompleted,
      totalExecutions: plan.totalExecutions,
    });
  }
}

export const dcaService = new DcaService();
