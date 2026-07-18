import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EventCategory {
  CONCERT = 'concert',
  EXHIBITION = 'exhibition',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  SPORTS = 'sports',
  OTHER = 'other',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: EventCategory, default: EventCategory.OTHER })
  category!: EventCategory;

  @Column({ type: 'varchar', length: 255, nullable: true })
  venue!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  organizer!: string | null;

  @Column({ type: 'datetime' })
  startDate!: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate!: Date | null;

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.DRAFT })
  status!: EventStatus;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  imageKey!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
