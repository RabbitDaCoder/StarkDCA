// ─── DCA Controller ──────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { dcaService } from './dca.service';
import { successResponse } from '../../utils/response';

class DcaController {
  /**
   * POST /api/v1/plans
   * Create a new DCA plan.
   */
  async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await dcaService.createPlan(req.user!.userId, req.body);
      res.status(201).json(successResponse(plan));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/plans
   * List user's DCA plans with cursor-based pagination.
   */
  async listPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await dcaService.listPlans(req.user!.userId, req.query as any);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/plans/:planId
   * Get a single plan by ID.
   */
  async getPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await dcaService.getPlanById(req.params.planId, req.user!.userId);
      res.json(successResponse(plan));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/plans/:planId/cancel
   * Cancel a DCA plan.
   */
  async cancelPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await dcaService.cancelPlan(req.params.planId, req.user!.userId);
      res.json(successResponse(plan));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/plans/:planId/executions
   * Get execution history for a plan.
   */
  async getExecutionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await dcaService.getExecutionHistory(
        req.params.planId,
        req.user!.userId,
        req.query as any,
      );
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}

export const dcaController = new DcaController();
