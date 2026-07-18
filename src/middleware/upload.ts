import { randomUUID } from 'crypto';
import path from 'path';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { Request } from 'express';
import { s3Client, S3_BUCKET } from '../config/s3';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
}

/**
 * Multer middleware that streams a single `image` field directly to S3.
 * The object key is stored under `events/` with a random prefix.
 */
export const uploadEventImage = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (_req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `events/${randomUUID()}${ext}`);
    },
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('image');
