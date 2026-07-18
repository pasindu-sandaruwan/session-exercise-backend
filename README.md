# University Events API

A public REST API for managing university events (concerts, exhibitions, workshops, seminars, sports, etc.). Built with **Express + TypeScript**, **MySQL via TypeORM**, single-image upload to **AWS S3**, and interactive **Swagger** docs.

No authentication is required — this is a fully public API.

## Tech Stack

- Node.js + TypeScript
- Express
- TypeORM + MySQL (`mysql2`)
- AWS S3 (`@aws-sdk/client-s3` + `multer-s3`) for image storage
- `class-validator` / `class-transformer` for request validation
- Swagger (`swagger-jsdoc` + `swagger-ui-express`)

## Getting Started (local)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`. For a local MySQL on your machine use `DB_HOST=localhost`.

3. **Start MySQL** (either your own local instance, or just the DB from compose):

   ```bash
   docker compose up -d mysql
   ```

4. **Run in dev mode** (auto-reload):

   ```bash
   npm run dev
   ```

   - API:     http://localhost:3000/api/events
   - Swagger:  http://localhost:3000/docs
   - Health:   http://localhost:3000/health

## Endpoints

| Method   | Path                     | Description                                  |
|----------|--------------------------|----------------------------------------------|
| `POST`   | `/api/events`            | Create an event                              |
| `GET`    | `/api/events`            | List events (`?category=&status=&page=&limit=`) |
| `GET`    | `/api/events/:id`        | Get one event (includes `imageUrl`)          |
| `PATCH`  | `/api/events/:id`        | Update an event                              |
| `DELETE` | `/api/events/:id`        | Delete an event (also removes its S3 image)  |
| `POST`   | `/api/events/:id/image`  | Upload/replace image (`multipart/form-data`, field `image`) |
| `DELETE` | `/api/events/:id/image`  | Remove an event's image                      |
| `GET`    | `/health`                | Health check                                 |
| `GET`    | `/docs`                  | Swagger UI                                   |

### Example

```bash
# Create
curl -X POST http://localhost:3000/api/events \
  -H 'Content-Type: application/json' \
  -d '{"title":"Spring Concert","category":"concert","venue":"Main Hall","startDate":"2026-09-01T18:00:00Z","status":"published"}'

# Upload an image
curl -X POST http://localhost:3000/api/events/<id>/image \
  -F 'image=@/path/to/poster.jpg'
```

## Image Storage

Images are uploaded through the API and streamed directly to S3 via `multer-s3`. The stored object's public URL is saved on the event as `imageUrl` and returned with every event response, so the frontend can load images directly from S3.

> The S3 bucket is assumed to allow public read of uploaded objects (or be fronted by a public URL/CloudFront). If your bucket is private, image retrieval should be switched to presigned GET URLs.

## Docker

Build and run the whole stack (API + MySQL):

```bash
docker compose up --build
```

For AWS S3 to work in the container, export `S3_BUCKET`, `AWS_REGION`, and (unless using an IAM role) `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` before running compose.

### Production / RDS

The image is fully configured via environment variables. To point at RDS, set `DB_HOST` to your RDS endpoint (plus the matching credentials) when running the container — no code or image changes needed. On ECS/EC2 you can omit the AWS keys and rely on the instance IAM role.

## Notes

- `DB_SYNCHRONIZE=true` auto-creates/updates tables from the entities — convenient for this exercise. For production, disable it and adopt TypeORM migrations.

## Scripts

| Script            | Description                        |
|-------------------|------------------------------------|
| `npm run dev`     | Run with live reload (ts-node-dev) |
| `npm run build`   | Compile TypeScript to `dist/`      |
| `npm start`       | Run compiled output                |
| `npm run typecheck` | Type-check without emitting      |
