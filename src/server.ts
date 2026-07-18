import 'reflect-metadata';
import { AppDataSource } from './config/data-source';
import { ensureDatabase } from './config/ensure-database';
import { createApp } from './app';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  try {
    // Create the database if it doesn't exist yet, then connect.
    await ensureDatabase();
    await AppDataSource.initialize();
    // eslint-disable-next-line no-console
    console.log('Database connected');

    const app = createApp();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on http://localhost:${env.port}`);
      // eslint-disable-next-line no-console
      console.log(`Swagger docs at   http://localhost:${env.port}/docs`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start application:', err);
    process.exit(1);
  }
}

void bootstrap();
