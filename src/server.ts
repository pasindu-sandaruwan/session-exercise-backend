import 'reflect-metadata';
import { AppDataSource } from './config/data-source';
import { createApp } from './app';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  try {
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
