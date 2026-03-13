# Setup Guide (Phase 1)

## Requirements
- Node.js 18+
- npm
- MongoDB URI

## Install
From the repository root:

```bash
npm install
```

If your PowerShell policy blocks npm scripts, use:

```powershell
npm.cmd install
```

## Run
- Backend: `npm run dev:server`
- Frontend: `npm run dev:frontend`

## Type-check
- `npm run typecheck`

## Tests
- `npm run test` (runs backend unit and API tests)

## Backup restore
- Profile and Upload support importing backup files in `.json` and `.csv` formats.

## TypeScript migration note
- Frontend imports for migrated modules use extensionless paths (e.g. `../services/api`) to resolve `.ts` files cleanly.

## Environment
- `server/.env`: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `PORT`
- `frontend/.env.local`: `VITE_API_URL`

Recommended auth env additions:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN` (default `15m`)
- `JWT_REFRESH_EXPIRES_IN` (default `7d`)

Push notification env additions:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

Background update job env additions:
- `ENABLE_UPDATE_JOBS` (`1` to enable)
- `UPDATE_CRON` (cron expression, default `*/30 * * * *`)
- `UPDATE_ENGINE_RATE_LIMIT_MS` (per-source request gap, default `1000`)
- `UPDATE_ENGINE_CACHE_MS` (scan result cache TTL, default `600000`)
- `UPDATE_ENGINE_TIMEOUT_MS` (HTTP timeout per request, default `10000`)
- `UPDATE_ENGINE_ENABLE_PLAYWRIGHT` (`1` enables dynamic fallback parser)
- `ASURA_BASE_URL`, `REAPER_BASE_URL`, `FLAME_BASE_URL` (source base URLs)
- `ADMIN_DEBUG_KEY` (optional `x-admin-key` guard for `/api/admin/check-updates`)

Optional AI provider env:
- `OPENAI_API_KEY` (fallback heuristics still work if unset)
- `OPENAI_MODEL` (default `gpt-4.1-mini`)
