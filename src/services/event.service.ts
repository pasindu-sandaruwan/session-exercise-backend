import { Repository } from 'typeorm';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { AppDataSource } from '../config/data-source';
import { Event } from '../entities/Event';
import { CreateEventDto, UpdateEventDto, ListEventsQueryDto } from '../dtos/event.dto';
import { s3Client, S3_BUCKET } from '../config/s3';
import { NotFoundError } from '../utils/http-error';

export interface PaginatedEvents {
  data: Event[];
  total: number;
  page: number;
  limit: number;
}

export class EventService {
  private get repo(): Repository<Event> {
    return AppDataSource.getRepository(Event);
  }

  async create(dto: CreateEventDto): Promise<Event> {
    const event = this.repo.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
    return this.repo.save(event);
  }

  async list(query: ListEventsQueryDto): Promise<PaginatedEvents> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;

    const where: Record<string, unknown> = {};
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { startDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Event> {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundError(`Event with id "${id}" not found`);
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findById(id);
    Object.assign(event, {
      ...dto,
      ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
      ...(dto.endDate !== undefined
        ? { endDate: dto.endDate ? new Date(dto.endDate) : null }
        : {}),
    });
    return this.repo.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findById(id);
    if (event.imageKey) {
      await this.deleteS3Object(event.imageKey);
    }
    await this.repo.remove(event);
  }

  /** Attaches (or replaces) an event's image after it has been uploaded to S3. */
  async setImage(id: string, key: string, url: string): Promise<Event> {
    const event = await this.findById(id);
    const previousKey = event.imageKey;

    event.imageKey = key;
    event.imageUrl = url;
    const saved = await this.repo.save(event);

    if (previousKey && previousKey !== key) {
      await this.deleteS3Object(previousKey);
    }
    return saved;
  }

  async removeImage(id: string): Promise<Event> {
    const event = await this.findById(id);
    if (event.imageKey) {
      await this.deleteS3Object(event.imageKey);
    }
    event.imageKey = null;
    event.imageUrl = null;
    return this.repo.save(event);
  }

  private async deleteS3Object(key: string): Promise<void> {
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    } catch (err) {
      // Non-fatal: log and continue so DB state stays consistent.
      // eslint-disable-next-line no-console
      console.error(`Failed to delete S3 object "${key}":`, err);
    }
  }
}

export const eventService = new EventService();
