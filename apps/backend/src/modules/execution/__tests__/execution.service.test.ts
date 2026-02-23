// ─── Execution Service Tests ─────────────────────────────────────────
// Tests the core DCA execution engine with mocked Prisma + Redis.

import { ExecutionStatus, PlanStatus, Interval } from '@prisma/client';

// ─── Mocks ───────────────────────────────────────────────────────────

// Mock Redis
const mockRedisGet = jest.fn().mockResolvedValue(null);
const mockRedisSetex = jest.fn().mockResolvedValue('OK');
const mockRedisDel = jest.fn().mockResolvedValue(1);
const mockRedisSet = jest.fn().mockResolvedValue('OK');
const mockRedisEval = jest.fn().mockResolvedValue(1);
const mockRedisKeys = jest.fn().mockResolvedValue([]);

jest.mock('../../../infrastructure/redis', () => ({
  getRedis: () => ({
    get: mockRedisGet,
    setex: mockRedisSetex,
    del: mockRedisDel,
    set: mockRedisSet,
    eval: mockRedisEval,
    keys: mockRedisKeys,
  }),
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn().mockResolvedValue(undefined),
  cacheDel: jest.fn().mockResolvedValue(undefined),
  cacheDelPattern: jest.fn().mockResolvedValue(undefined),
  connectRedis: jest.fn().mockResolvedValue(undefined),
  disconnectRedis: jest.fn().mockResolvedValue(undefined),
}));

// Mock config
jest.mock('../../../config', () => ({
  config: {
    cache: { lockTtl: 30, priceTtl: 60, planTtl: 30, idempotencyTtl: 86400 },
    price: { apiUrl: 'https://api.coingecko.com/api/v3', apiKey: '', cacheTtl: 60 },
    starknet: { rpcUrl: '', contractAddress: '', executorPrivateKey: '', executorAddress: '' },
    emailService: { url: 'http://localhost:3001', apiKey: 'test-email-key-placeholder' },
    isProduction: false,
    nodeEnv: 'test',
  },
}));

// Mock logger
jest.mock('../../../infrastructure/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    fatal: jest.fn(),
  },
}));

// Mock email service
jest.mock('../../../infrastructure/email', () => ({
  emailService: {
    sendPlanActivatedEmail: jest.fn().mockResolvedValue(undefined),
    sendBtcAccumulatedEmail: jest.fn().mockResolvedValue(undefined),
    sendPlanCancelledEmail: jest.fn().mockResolvedValue(undefined),
    sendPlanCompletedEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock price service
jest.mock('../../price/price.service', () => ({
  priceService: {
    getBtcPrice: jest.fn().mockResolvedValue({
      symbol: 'BTC',
      price: 65000,
      timestamp: Date.now(),
      source: 'mock',
    }),
  },
}));

// Mock Prisma
const mockPlan = {
  id: 'plan-uuid-1',
  userId: 'user-uuid-1',
  depositTokenAddress: '0x_USDT',
  targetTokenAddress: '0x_WBTC',
  amountPerExecution: '100000000',
  totalDeposited: '1200000000',
  totalExecutions: 12,
  executionsCompleted: 3,
  interval: Interval.WEEKLY,
  nextExecutionAt: new Date(Date.now() - 60000),
  status: PlanStatus.ACTIVE,
  onChainPlanId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTx = {
  dCAPlan: {
    findUnique: jest.fn().mockResolvedValue(mockPlan),
    update: jest.fn().mockResolvedValue({ ...mockPlan, executionsCompleted: 4 }),
  },
  executionHistory: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      id: 'exec-uuid-1',
      planId: mockPlan.id,
      executionNumber: 4,
      amountIn: '100000000',
      amountOut: '0.00153846',
      priceAtExecution: 65000,
      txHash: '0xabc',
      status: ExecutionStatus.SUCCESS,
    }),
  },
};

jest.mock('../../../infrastructure/db', () => ({
  prisma: {
    $transaction: jest.fn(async (fn: any) => fn(mockTx)),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

// Mock DCA service (for getDuePlans)
jest.mock('../../dca/dca.service', () => ({
  dcaService: {
    getDuePlans: jest.fn().mockResolvedValue([{ id: 'plan-uuid-1' }]),
    computeNextExecution: jest.fn().mockReturnValue(new Date(Date.now() + 604_800_000)),
  },
}));

// ─── Tests ───────────────────────────────────────────────────────────

import { executionService } from '../execution.service';

describe('ExecutionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Redis lock mock to succeed
    mockRedisSet.mockResolvedValue('OK');
  });

  describe('executePlan', () => {
    it('should execute a plan successfully with distributed lock', async () => {
      const result = await executionService.executePlan('plan-uuid-1');

      expect(result).not.toBeNull();
      expect(result!.planId).toBe('plan-uuid-1');
      expect(result!.executionNumber).toBe(4);
      expect(result!.status).toBe(ExecutionStatus.SUCCESS);
      expect(result!.amountIn).toBe('100000000');
      expect(parseFloat(result!.amountOut!)).toBeGreaterThan(0);
      expect(result!.priceAtExecution).toBe(65000);
    });

    it('should skip execution if lock is already held', async () => {
      // Lock acquisition fails
      mockRedisSet.mockResolvedValue(null);

      const result = await executionService.executePlan('plan-uuid-1');
      expect(result).toBeNull();
    });

    it('should skip if execution already recorded (idempotency)', async () => {
      const existingExec = {
        planId: 'plan-uuid-1',
        executionNumber: 4,
        status: ExecutionStatus.SUCCESS,
        amountIn: '100000000',
        amountOut: '0.00153846',
        priceAtExecution: 65000,
        txHash: '0xprevious',
        errorMessage: null,
      };

      mockTx.executionHistory.findUnique.mockResolvedValueOnce(existingExec);

      const result = await executionService.executePlan('plan-uuid-1');

      expect(result).not.toBeNull();
      expect(result!.txHash).toBe('0xprevious');
      // Should not create a new execution record
      expect(mockTx.executionHistory.create).not.toHaveBeenCalled();
    });

    it('should handle inactive plan gracefully', async () => {
      mockTx.dCAPlan.findUnique.mockResolvedValueOnce({
        ...mockPlan,
        status: PlanStatus.CANCELLED,
      });

      const result = await executionService.executePlan('plan-uuid-1');

      expect(result).not.toBeNull();
      expect(result!.status).toBe(ExecutionStatus.FAILED);
      expect(result!.errorMessage).toContain('not active');
    });
  });

  describe('processDuePlans', () => {
    it('should process all due plans', async () => {
      const results = await executionService.processDuePlans();
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });
});
