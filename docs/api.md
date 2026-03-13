# API Overview (Current)

Base: `/api`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Manhwa
- `GET /manhwa`
- `POST /manhwa`
- `PUT /manhwa/:id`
- `DELETE /manhwa/:id`

## Progress
- `GET /progress/:id`
- `PUT /progress/:id`

## Updates
- `GET /updates`
- `PUT /updates/:id/read`
- `PUT /updates/:id`

## Admin
- `POST /admin/check-updates` (manual trigger for update engine; requires auth and optional `x-admin-key`)

## Stats
- `GET /stats/overview`

## Notifications
- `GET /notifications/public-key`
- `POST /notifications/subscribe`
- `POST /notifications/unsubscribe`
- `POST /notifications/test`

## AI
- `POST /ai/metadata-from-url`
- `GET /ai/recommendations`
- `GET /ai/predictions`

## Jobs
- `updateScheduler` (node-cron every 30 minutes): checks source scanners and updates `/updates` data.

Implemented in Phase 2 foundation:
- Zod validation on auth and manhwa write endpoints
- Access + refresh token rotation flow
- Helmet + auth route rate limiting + CORS origin filtering
