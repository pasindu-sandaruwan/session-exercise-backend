import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/event.service';
import { CreateEventDto, UpdateEventDto, ListEventsQueryDto } from '../dtos/event.dto';
import { BadRequestError } from '../utils/http-error';

export async function createEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const event = await eventService.create(req.body as CreateEventDto);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

export async function listEvents(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await eventService.list(req.query as unknown as ListEventsQueryDto);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const event = await eventService.findById(req.params.id);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const event = await eventService.update(req.params.id, req.body as UpdateEventDto);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await eventService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // multer-s3 augments the file with `key` and `location`.
    const file = req.file as (Express.Multer.File & { key?: string; location?: string }) | undefined;
    if (!file || !file.key || !file.location) {
      throw new BadRequestError('No image file provided (field name must be "image")');
    }
    const event = await eventService.setImage(req.params.id, file.key, file.location);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function deleteImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const event = await eventService.removeImage(req.params.id);
    res.json(event);
  } catch (err) {
    next(err);
  }
}
