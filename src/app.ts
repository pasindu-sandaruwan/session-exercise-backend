import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import eventRoutes from './routes/event.routes';
import { setupSwagger } from './swagger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  /**
   * @openapi
   * /health:
   *   get:
   *     summary: Health check
   *     tags: [System]
   *     responses:
   *       200:
   *         description: Service is up
   */
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/events', eventRoutes);

  setupSwagger(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
