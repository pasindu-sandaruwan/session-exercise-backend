import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { Event } from '../entities/Event';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  // Auto-sync entity schema in dev. For production, disable and use migrations.
  synchronize: env.db.synchronize,
  logging: env.nodeEnv === 'development',
  entities: [Event],
  migrations: [],
  subscribers: [],
});
