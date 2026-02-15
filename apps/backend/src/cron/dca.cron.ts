import cron from 'node-cron';
import { config } from '../config';
import { dcaService } from '../services';
import { logger } from '../utils/logger';

export function startDcaCron(): void {
  logger.info(`DCA cron scheduled: ${config.cron.schedule}`);

  cron.schedule(config.cron.schedule, async () => {
    logger.info('DCA cron tick — scanning for executable plans...');

    try {
      const plans = await dcaService.getExecutablePlans();

      if (plans.length === 0) {
        logger.debug('No plans to execute');
        return;
      }

      logger.info(`Found ${plans.length} plan(s) to execute`);

      for (const plan of plans) {
        try {
          await dcaService.executePlan(plan);
        } catch (err) {
          logger.error(`Failed to execute plan ${plan.id}`, err);
        }
      }
    } catch (error) {
      logger.error('DCA cron error', error);
    }
  });
}
