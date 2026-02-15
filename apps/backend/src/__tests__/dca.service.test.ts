import { DcaService } from '../../services/dca.service';
import { Interval, PlanStatus } from '@stark-dca/shared-types';

// Mock the price service
jest.mock('../../services/price.service', () => ({
  priceService: {
    getBtcPrice: jest.fn().mockResolvedValue({
      symbol: 'BTC',
      price: 65000,
      timestamp: Date.now(),
      source: 'mock',
    }),
  },
}));

describe('DcaService', () => {
  let service: DcaService;

  beforeEach(() => {
    service = new DcaService();
  });

  describe('createPlan', () => {
    it('should create a new DCA plan with correct parameters', async () => {
      const plan = await service.createPlan(
        '0xABC123',
        '100000000', // 100 USDT (6 decimals)
        10,
        Interval.Weekly,
      );

      expect(plan).toBeDefined();
      expect(plan.owner).toBe('0xABC123');
      expect(plan.amountPerExecution).toBe('100000000');
      expect(plan.totalExecutions).toBe(10);
      expect(plan.executionsCompleted).toBe(0);
      expect(plan.interval).toBe(Interval.Weekly);
      expect(plan.status).toBe(PlanStatus.Active);
      expect(plan.id).toMatch(/^plan_/);
    });

    it('should calculate total deposited correctly', async () => {
      const plan = await service.createPlan('0xABC123', '250', 4, Interval.Monthly);
      expect(plan.totalDeposited).toBe('1000');
    });
  });

  describe('cancelPlan', () => {
    it('should cancel an active plan', async () => {
      const plan = await service.createPlan('0xOwner', '100', 5, Interval.Daily);
      const cancelled = await service.cancelPlan(plan.id, '0xOwner');

      expect(cancelled.status).toBe(PlanStatus.Cancelled);
    });

    it('should reject cancellation by non-owner', async () => {
      const plan = await service.createPlan('0xOwner', '100', 5, Interval.Daily);

      await expect(service.cancelPlan(plan.id, '0xOtherUser')).rejects.toThrow('Not plan owner');
    });
  });

  describe('executePlan', () => {
    it('should execute a plan and record an execution log', async () => {
      const plan = await service.createPlan('0xOwner', '100', 3, Interval.Daily);

      // Force the plan to be executable now
      plan.nextExecutionAt = Date.now() - 1000;

      const log = await service.executePlan(plan);

      expect(log.planId).toBe(plan.id);
      expect(log.amountIn).toBe('100');
      expect(parseFloat(log.amountOut)).toBeGreaterThan(0);
      expect(log.priceAtExecution).toBe(65000);
      expect(plan.executionsCompleted).toBe(1);
    });

    it('should mark plan as completed after all executions', async () => {
      const plan = await service.createPlan('0xOwner', '100', 1, Interval.Daily);
      plan.nextExecutionAt = Date.now() - 1000;

      await service.executePlan(plan);

      expect(plan.status).toBe(PlanStatus.Completed);
      expect(plan.executionsCompleted).toBe(1);
    });
  });
});
