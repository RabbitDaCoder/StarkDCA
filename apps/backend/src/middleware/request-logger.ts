// ─── Request Logger Middleware (Morgan) ───────────────────────────────
import morgan from 'morgan';

// Use 'dev' format in development (colored, concise), 'combined' in production (Apache-style)
const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

export const requestLogger = morgan(format);
