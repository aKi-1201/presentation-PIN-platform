# Presentation PIN Platform (Prototype)

Temporary PDF access via short PIN codes.

## Stack
- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Prisma + PostgreSQL
- PDF.js (client-side viewing)

## Getting Started
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies.
3. Run Prisma migrations.
4. Start the dev server.

## Scripts
- `npm run dev`
- `npm run prisma:migrate`
- `npm run cleanup`

## Deployment (Production)
1. Set `APP_URL=https://zlide.app` in `.env` or via Docker Compose.
2. Ensure `Caddyfile` targets `zlide.app`.
3. Run `docker compose up -d --build`.

## Notes
- Uploads are stored under `/data/uploads` (not public).
- Management tokens are stored as hashes only.
