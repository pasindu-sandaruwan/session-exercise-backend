import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestError } from '../utils/http-error';

type ClassType<T> = new () => T;
type Source = 'body' | 'query';

/**
 * Validates and transforms the given request source against a DTO class.
 * On success the parsed instance replaces req[source].
 */
export function validateDto<T extends object>(
  dtoClass: ClassType<T>,
  source: Source = 'body'
) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(dtoClass, req[source], {
      enableImplicitConversion: true,
    });

    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const details = errors.map((e) => ({
        property: e.property,
        constraints: e.constraints,
      }));
      return next(new BadRequestError('Validation failed', details));
    }

    // req.query has only a getter in Express 5; assign safely for both versions.
    if (source === 'query') {
      Object.defineProperty(req, 'query', { value: instance, configurable: true });
    } else {
      req[source] = instance as never;
    }
    next();
  };
}
