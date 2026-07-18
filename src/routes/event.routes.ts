import { Router, Request, Response, NextFunction } from 'express';
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  uploadImage,
  deleteImage,
} from '../controllers/event.controller';
import { validateDto } from '../middleware/validate';
import { CreateEventDto, UpdateEventDto, ListEventsQueryDto } from '../dtos/event.dto';
import { uploadEventImage } from '../middleware/upload';
import { assertS3Configured } from '../config/env';
import { eventService } from '../services/event.service';

const router = Router();

/** Verifies the event exists before we stream a file to S3 (avoids orphan objects). */
async function ensureEventExists(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertS3Configured();
    await eventService.findById(req.params.id);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * tags:
 *   - name: Events
 *     description: University event management
 */

/**
 * @openapi
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventDto'
 *     responses:
 *       201:
 *         description: Event created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *   get:
 *     summary: List events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           $ref: '#/components/schemas/EventCategory'
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/EventStatus'
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEvents'
 */
router
  .route('/')
  .post(validateDto(CreateEventDto), createEvent)
  .get(validateDto(ListEventsQueryDto, 'query'), listEvents);

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by id
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/EventId'
 *     responses:
 *       200:
 *         description: The event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Not found
 *   patch:
 *     summary: Update an event
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/EventId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEventDto'
 *     responses:
 *       200:
 *         description: Updated event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete an event (also removes its S3 image)
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/EventId'
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router
  .route('/:id')
  .get(getEvent)
  .patch(validateDto(UpdateEventDto), updateEvent)
  .delete(deleteEvent);

/**
 * @openapi
 * /api/events/{id}/image:
 *   post:
 *     summary: Upload or replace an event's image
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/EventId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event with populated imageUrl
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid or missing file
 *       404:
 *         description: Not found
 *       503:
 *         description: S3 not configured on the server
 *   delete:
 *     summary: Remove an event's image
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/EventId'
 *     responses:
 *       200:
 *         description: Event with image removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Not found
 */
router
  .route('/:id/image')
  .post(ensureEventExists, uploadEventImage, uploadImage)
  .delete(deleteImage);

export default router;
