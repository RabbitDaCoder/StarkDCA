import { Request, Response } from 'express';
import { dcaService } from '../services';
import { ApiResponse, DCAPlan, CreatePlanRequest, Interval } from '@stark-dca/shared-types';

export class DcaController {
  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      const { amountPerExecution, totalExecutions, interval } = req.body as CreatePlanRequest;
      const owner = req.headers['x-starknet-address'] as string;

      if (!owner) {
        res.status(400).json({ success: false, error: 'Missing x-starknet-address header' });
        return;
      }

      const plan = await dcaService.createPlan(
        owner,
        amountPerExecution,
        totalExecutions,
        interval,
      );
      const response: ApiResponse<DCAPlan> = { success: true, data: plan };
      res.status(201).json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async cancelPlan(req: Request, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const owner = req.headers['x-starknet-address'] as string;

      if (!owner) {
        res.status(400).json({ success: false, error: 'Missing x-starknet-address header' });
        return;
      }

      const plan = await dcaService.cancelPlan(planId, owner);
      const response: ApiResponse<DCAPlan> = { success: true, data: plan };
      res.json(response);
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const owner = req.headers['x-starknet-address'] as string;

      if (!owner) {
        res.status(400).json({ success: false, error: 'Missing x-starknet-address header' });
        return;
      }

      const plans = await dcaService.getPlansByOwner(owner);
      const response: ApiResponse<DCAPlan[]> = { success: true, data: plans };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await dcaService.getPlanById(req.params.planId);

      if (!plan) {
        res.status(404).json({ success: false, error: 'Plan not found' });
        return;
      }

      const response: ApiResponse<DCAPlan> = { success: true, data: plan };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getExecutionLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await dcaService.getExecutionLogs(req.params.planId);
      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const dcaController = new DcaController();
