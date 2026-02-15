import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import routes from './routes';
import { startDcaCron } from './cron/dca.cron';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Start server
app.listen(config.port, () => {
  logger.info(`StarkDCA backend running on port ${config.port}`);
  startDcaCron();
});

export default app;
