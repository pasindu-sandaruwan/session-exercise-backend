import path from 'path';
import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'University Events API',
      version: '1.0.0',
      description:
        'Public REST API for managing university events (concerts, exhibitions, workshops, etc.) with single-image upload to AWS S3.',
    },
    servers: [{ url: '/', description: 'Current host' }],
    components: {
      parameters: {
        EventId: {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Event UUID',
        },
      },
      schemas: {
        EventCategory: {
          type: 'string',
          enum: ['concert', 'exhibition', 'workshop', 'seminar', 'sports', 'other'],
        },
        EventStatus: {
          type: 'string',
          enum: ['draft', 'published', 'cancelled'],
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            category: { $ref: '#/components/schemas/EventCategory' },
            venue: { type: 'string', nullable: true },
            organizer: { type: 'string', nullable: true },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            capacity: { type: 'integer', nullable: true },
            status: { $ref: '#/components/schemas/EventStatus' },
            imageUrl: { type: 'string', nullable: true },
            imageKey: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateEventDto: {
          type: 'object',
          required: ['title', 'startDate'],
          properties: {
            title: { type: 'string', maxLength: 255 },
            description: { type: 'string' },
            category: { $ref: '#/components/schemas/EventCategory' },
            venue: { type: 'string', maxLength: 255 },
            organizer: { type: 'string', maxLength: 255 },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            capacity: { type: 'integer', minimum: 0 },
            status: { $ref: '#/components/schemas/EventStatus' },
          },
        },
        UpdateEventDto: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 255 },
            description: { type: 'string' },
            category: { $ref: '#/components/schemas/EventCategory' },
            venue: { type: 'string', maxLength: 255 },
            organizer: { type: 'string', maxLength: 255 },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            capacity: { type: 'integer', minimum: 0 },
            status: { $ref: '#/components/schemas/EventStatus' },
          },
        },
        PaginatedEvents: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Event' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
          },
        },
      },
    },
  },
  // Scan route files (works for both .ts in dev and .js in dist).
  apis: [
    path.join(__dirname, 'routes/*.js'),
    path.join(__dirname, 'routes/*.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.get('/docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
