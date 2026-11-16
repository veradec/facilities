# Public Facilities Directory

Full-stack Next.js application for collecting, reviewing, and publishing public facility submissions with videos and map locations.

## Architecture overview
- **Frontend + backend:** Next.js 14 App Router (TypeScript) with server components for public pages and API routes for submissions, admin review, and secure media delivery.
- **Database:** SQLite via Prisma for simple local setup; schema supports migrations and can be adapted to PostgreSQL/MySQL by changing datasource/provider and `DATABASE_URL`.
- **Auth:** NextAuth credentials provider (JWT sessions) for admin-only access to `/approval` and admin APIs. Authorization is enforced server-side in route handlers and page guards.
- **Maps:** Leaflet/react-leaflet with OpenStreetMap tiles (configurable via env). Public detail page includes an embedded OSM map.
- **Media storage:** Local private filesystem directory (`MEDIA_STORAGE_DIR`, default `./uploads`) outside public web root. Uploads get non-guessable UUID filenames. Server validates type/size and never trusts client MIME/filename. Media served via `/api/media/[id]` only when approved+public or requested by authenticated admin.
- **Public vs admin data:** Public queries select approved submissions only and include only public media; contact details/internal notes/rejection reasons are not exposed on public pages/APIs.

## Key implementation choices
- Submissions are created as `PENDING` with media `isPublic=false`; approval transaction sets submission approved and marks its media public in one step.
- Server-side validation with Zod for submission/review payloads; client-side validation/progress UX in upload form.
- Admin review API blocks non-admins and prevents re-reviewing non-pending submissions; UI asks for confirmation before finalize.
- SQLite-compatible case-insensitive search implemented in application filtering for portability.
- Seed includes one approved facility and one pending submission (with placeholder media files) for local testing.

## Pages
- `/` approved facilities, search/type filters, cards, loading/empty/error states
- `/upload` responsive submission form with map picker, validation, progress, confirmation
- `/approval` admin sign-in and pending review UI (filters, pagination, media playback, map, approve/reject with note/reason)
- `/map` approved markers with popups, shared filters, fit-to-bounds, empty state
- `/facilities/[id]` approved-only detail page with info, location, approved media

## Setup
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   ```bash
   cp .env.example .env
   # set NEXTAUTH_SECRET to a strong random value
   ```
3. **Generate Prisma client and run migrations**
   ```bash
   npm run prisma:generate
   npx prisma migrate deploy
   ```
   (For iterative local schema changes you can use `npm run prisma:migrate`.)
4. **Seed local data and admin user**
   ```bash
   npm run db:seed
   ```
   Default admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.
5. **Run development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Environment variables
See `.env.example`. Key values:
- `DATABASE_URL` SQLite file path
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (used by seed)
- `MEDIA_STORAGE_DIR` private upload directory
- `MAX_VIDEO_SIZE_MB`, `MAX_IMAGE_SIZE_MB`, `ALLOWED_VIDEO_TYPES`, `ALLOWED_IMAGE_TYPES`
- `MAP_TILE_URL`, `MAP_ATTRIBUTION` (and public `NEXT_PUBLIC_*` equivalents if customized client-side)

## Tests
Basic unit tests cover validation, rejection rules, and media access control:
```bash
npm test
```
Type/lint checks (if dependencies installed):
```bash
npm run typecheck
npm run lint
```

## Security notes
- Do not commit `.env` or `uploads/`.
- Uploaded/unapproved media is never publicly served; approval required for public access.
- Admin UI hiding is not relied upon—server routes enforce authorization.
- Use HTTPS, strong secrets, and a managed object store/database in production.
