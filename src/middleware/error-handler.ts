import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { HttpError } from '../utils/http-error';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  if (err instanceof MulterError) {
    res.status(400).json({ message: `Upload error: ${err.message}` });
    return;
  }

  if (err instanceof Error && err.message.includes('Only image files')) {
    res.status(400).json({ message: err.message });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found' });
}
