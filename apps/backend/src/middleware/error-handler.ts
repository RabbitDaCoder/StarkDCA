// ─── Centralized Error Handler ───────────────────────────────────────
// Catches all errors, returns consistent JSON structure.

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';
import { logger } from '../infrastructure/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // ── Zod Validation Error ─────────────────────────────────────────
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');

    res.status(400).json(errorResponse('VALIDATION_ERROR', message));
    return;
  }

  // ── Operational App Error ────────────────────────────────────────
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err }, 'Non-operational error');
    }

    res.status(err.statusCode).json(errorResponse(err.code, err.message));
    return;
  }

  // ── Unexpected Error ─────────────────────────────────────────────
  logger.error({ err }, 'Unhandled error');

  res.status(500).json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred'));
}
