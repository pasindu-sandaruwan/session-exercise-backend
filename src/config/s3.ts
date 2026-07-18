import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

/**
 * S3 client. If explicit credentials are provided via env they are used;
 * otherwise the SDK's default provider chain applies (shared config / IAM role).
 */
export const s3Client = new S3Client({
  region: env.aws.region,
  ...(env.aws.accessKeyId && env.aws.secretAccessKey
    ? {
        credentials: {
          accessKeyId: env.aws.accessKeyId,
          secretAccessKey: env.aws.secretAccessKey,
        },
      }
    : {}),
});

export const S3_BUCKET = env.aws.bucket;

/** Builds the public object URL for a given key (virtual-hosted-style). */
export function buildPublicUrl(key: string): string {
  return `https://${S3_BUCKET}.s3.${env.aws.region}.amazonaws.com/${key}`;
}
