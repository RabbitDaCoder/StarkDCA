// ─── Idempotency Middleware Tests ─────────────────────────────────────

import { Request, Response, NextFunction } from 'express';

// ─── Mocks ───────────────────────────────────────────────────────────
const mockGet = jest.fn();
const mockSetex = jest.fn();

jest.mock('../../infrastructure/redis', () => ({
  getRedis: () => ({
    get: mockGet,
    setex: mockSetex,
  }),
}));

jest.mock('../../config', () => ({
  config: {
    cache: { idempotencyTtl: 86400 },
  },
}));

jest.mock('../../infrastructure/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { idempotency } from '../../middleware/idempotency';

// ─── Helpers ─────────────────────────────────────────────────────────
function createMockReq(method: string, headers: Record<string, string> = {}): Partial<Request> {
  return {
    method,
    headers,
  };
}

function createMockRes(): Partial<Response> {
  const res: Partial<Response> = {
    statusCode: 200,
    status: jest.fn().mockReturnThis() as any,
    json: jest.fn().mockReturnThis() as any,
  };
  return res;
}

// ─── Tests ───────────────────────────────────────────────────────────
describe('Idempotency Middleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  it('should skip non-mutating methods (GET)', () => {
    const req = createMockReq('GET') as Request;
    const res = createMockRes() as Response;

    idempotency(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should require Idempotency-Key for POST requests', () => {
    const req = createMockReq('POST') as Request;
    const res = createMockRes() as Response;

    idempotency(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'MISSING_IDEMPOTENCY_KEY',
      }),
    );
  });

  it('should return cached response for duplicate key', async () => {
    const cachedResponse = JSON.stringify({
      statusCode: 201,
      body: { success: true, data: { id: 'plan-1' } },
    });

    mockGet.mockResolvedValueOnce(cachedResponse);

    const req = createMockReq('POST', { 'idempotency-key': 'test-key-123' }) as Request;
    const res = createMockRes() as Response;

    idempotency(req, res, next);

    // Wait for async Redis call
    await new Promise((r) => setTimeout(r, 10));

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'plan-1' } });
    expect(next).not.toHaveBeenCalled();
  });

  it('should pass through and cache for new key', async () => {
    mockGet.mockResolvedValueOnce(null);
    mockSetex.mockResolvedValueOnce('OK');

    const req = createMockReq('POST', { 'idempotency-key': 'new-key-456' }) as Request;
    const res = createMockRes() as Response;

    idempotency(req, res, next);

    // Wait for async Redis call
    await new Promise((r) => setTimeout(r, 10));

    expect(next).toHaveBeenCalled();
  });
});
