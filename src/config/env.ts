import dotenv from 'dotenv';
import { HttpError } from '../utils/http-error';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'university_events',
    synchronize: (process.env.DB_SYNCHRONIZE || 'true') === 'true',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || '',
    // Optional: when empty, the AWS SDK falls back to the default provider chain
    // (env, shared config, or IAM role on ECS/EC2).
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

/** Throws early if S3 is used without a bucket configured. */
export function assertS3Configured(): void {
  if (!env.aws.bucket) {
    throw new HttpError(
      503,
      'Image upload is unavailable: S3_BUCKET is not configured on the server.'
    );
  }
}
