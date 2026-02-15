import { DCAPlan, PlanStatus, Interval, ExecutionLog } from '@stark-dca/shared-types';
import { priceService } from './price.service';
import { logger } from '../utils/logger';

// In-memory store for demo/hackathon — swap with DB in production
const plans: Map<string, DCAPlan> = new Map();
const executions: ExecutionLog[] = [];

let planCounter = 0;

function generateId(): string {
  planCounter += 1;
  return `plan_${Date.now()}_${planCounter}`;
}

export class DcaService {
  async createPlan(
    owner: string,
    amountPerExecution: string,
    totalExecutions: number,
    interval: Interval,
  ): Promise<DCAPlan> {
    const now = Date.now();
    const plan: DCAPlan = {
      id: generateId(),
      owner,
      depositTokenAddress: '0x_USDT_ADDRESS',
      targetTokenAddress: '0x_WBTC_ADDRESS',
      amountPerExecution,
      totalDeposited: (BigInt(amountPerExecution) * BigInt(totalExecutions)).toString(),
      totalExecutions,
      executionsCompleted: 0,
      interval,
      nextExecutionAt: this.computeNextExecution(now, interval),
      status: PlanStatus.Active,
      createdAt: now,
      updatedAt: now,
    };

    plans.set(plan.id, plan);
    logger.info(`Plan created: ${plan.id} for ${owner}`);
    return plan;
  }

  async cancelPlan(planId: string, owner: string): Promise<DCAPlan> {
    const plan = plans.get(planId);
    if (!plan) throw new Error('Plan not found');
    if (plan.owner !== owner) throw new Error('Not plan owner');
    if (plan.status === PlanStatus.Cancelled) throw new Error('Plan already cancelled');

    plan.status = PlanStatus.Cancelled;
    plan.updatedAt = Date.now();
    plans.set(planId, plan);
    logger.info(`Plan cancelled: ${planId}`);
    return plan;
  }

  async getPlansByOwner(owner: string): Promise<DCAPlan[]> {
    return Array.from(plans.values()).filter((p) => p.owner === owner);
  }

  async getPlanById(planId: string): Promise<DCAPlan | undefined> {
    return plans.get(planId);
  }

  async getExecutablePlans(): Promise<DCAPlan[]> {
    const now = Date.now();
    return Array.from(plans.values()).filter(
      (p) =>
        p.status === PlanStatus.Active &&
        p.nextExecutionAt <= now &&
        p.executionsCompleted < p.totalExecutions,
    );
  }

  async executePlan(plan: DCAPlan): Promise<ExecutionLog> {
    const priceData = await priceService.getBtcPrice();
    const amountIn = plan.amountPerExecution;
    const amountOut = (parseFloat(amountIn) / priceData.price).toFixed(8);

    const log: ExecutionLog = {
      id: `exec_${Date.now()}`,
      planId: plan.id,
      executedAt: Date.now(),
      amountIn,
      amountOut,
      priceAtExecution: priceData.price,
      txHash: `0x${Math.random().toString(16).slice(2)}`, // placeholder
    };

    plan.executionsCompleted += 1;
    plan.nextExecutionAt = this.computeNextExecution(Date.now(), plan.interval);
    plan.updatedAt = Date.now();

    if (plan.executionsCompleted >= plan.totalExecutions) {
      plan.status = PlanStatus.Completed;
    }

    plans.set(plan.id, plan);
    executions.push(log);

    logger.info(`Plan ${plan.id} executed — bought ${amountOut} BTC at $${priceData.price}`);
    return log;
  }

  async getExecutionLogs(planId: string): Promise<ExecutionLog[]> {
    return executions.filter((e) => e.planId === planId);
  }

  private computeNextExecution(from: number, interval: Interval): number {
    const ms: Record<Interval, number> = {
      [Interval.Daily]: 86_400_000,
      [Interval.Weekly]: 604_800_000,
      [Interval.Biweekly]: 1_209_600_000,
      [Interval.Monthly]: 2_592_000_000,
    };
    return from + ms[interval];
  }
}

export const dcaService = new DcaService();
