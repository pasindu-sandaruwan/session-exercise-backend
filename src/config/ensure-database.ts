import mysql from 'mysql2/promise';
import { env } from './env';

/**
 * Ensures the target database exists before TypeORM connects.
 * Connects to the MySQL server WITHOUT selecting a database, runs
 * `CREATE DATABASE IF NOT EXISTS`, then closes the connection.
 * This lets the app bootstrap against a fresh MySQL/RDS instance
 * without a manual `CREATE DATABASE` step.
 */
export async function ensureDatabase(): Promise<void> {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    // no `database` here — it may not exist yet
  });

  try {
    // Database identifiers can't be parameterized; env.db.name comes from
    // trusted server config, and we escape it defensively.
    const dbName = env.db.name.replace(/`/g, '');
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` ` +
        `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    // eslint-disable-next-line no-console
    console.log(`Database "${dbName}" is ready`);
  } finally {
    await connection.end();
  }
}
