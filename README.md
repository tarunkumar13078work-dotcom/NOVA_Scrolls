# Nova Scrolls

Nova Scrolls is a futuristic manhwa tracker with a mobile-first, neon space dashboard. Users can register, log in, track their library, monitor unread chapter drops, and manage progress with smooth Framer Motion animations.

## Stack
- Frontend: React (Vite), TailwindCSS, Framer Motion, React Router, Axios, TanStack Query
- Backend: Node.js, Express.js
- Database: MongoDB Atlas via Mongoose
- Auth: JWT, bcrypt password hashing
- Deploy: Frontend on Vercel, Backend on Render, DB on MongoDB Atlas

## Features
- JWT auth with register/login/me endpoints
- Per-user libraries (userId on every model) and protected routes
- Dashboard with stats, search, filters, sorting, animated progress bars
- Updates center with unread counts and one-tap “Mark as Read”
- Upload form with live cover preview, status, current/latest chapter inputs
- Toasts, loading skeletons, offline demo fallback, empty states
- Animated space background, glassmorphism cards, bottom mobile nav
- Query-cached library data with background refetch and mutation invalidation
- Debounced search and virtualized rendering path for large library dashboards
- Offline snapshot cache with queued progress/favorite mutations that sync on reconnect
- Favorites pinning plus tags and collection metadata support in library records
- Reading activity tracking with streak, chapters/week, reading speed, and heatmap analytics
- Library backup workflows with JSON/CSV export and JSON/CSV import
- Automated multi-source update engine (Asura/Reaper/Flame) with unread detection and push dispatch hooks
- Desktop enhancements: keyboard shortcuts (A/U/R) and drag-drop JSON import on upload
- AI URL metadata autofill, recommendation suggestions, and finish-time predictions
- Optional provider-backed AI enhancement when `OPENAI_API_KEY` is configured, with fallback mode
- Incremental TypeScript migration now covers auth/data/toast contexts and hooks, local/offline services, push service, API/query clients, and core utility hooks
- Baseline automated tests: backend API health test and update service unit tests
- PWA install prompt CTA in app header with standalone detection
- App-level React error boundary with recovery UI for crash resilience

## Project structure
```
apps/
  web-mobile/            // Future dedicated mobile app target
  web-desktop/           // Future dedicated desktop app target
shared/
  types/ constants/ helpers/
infrastructure/
  docker/ deployment/
docs/
  architecture.md setup.md api.md
frontend/
  src/
    components/         // UI building blocks
    pages/              // Dashboard, Updates, Upload, Profile, Auth
    context/            // Auth, data, toast providers
    hooks/              // Convenience hooks
    services/           // Axios client
    animations/         // Motion presets
    styles/             // Tailwind entry + theme
server/
  controllers/ services/ middleware/ models/ routes/ validators/ database/ utils/
  server.js
  .env.example
```

## Workspace scripts
From the repository root:
- `npm run dev:frontend`
- `npm run dev:server`
- `npm run build`
- `npm run typecheck`

## VS Code task quick start
- Run `NOVA: Typecheck All` to validate frontend and server types.
- Run `NOVA: Build Frontend` to compile the production frontend bundle.
- Run `NOVA: Frontend Dev` and `NOVA: Server Dev` to launch both runtimes.
- Run `NOVA: Test` to execute server tests.

## Local setup
1) Requirements: Node 18+, npm, MongoDB Atlas URI
2) Install deps
```
cd server && npm install
cd ../frontend && npm install
```
3) Environment
- Copy server/.env.example to server/.env and fill values
- Create frontend/.env.local with `VITE_API_URL=http://localhost:5000/api`
4) Run dev servers
```
cd server && npm run dev      # API at http://localhost:5000
cd frontend && npm run dev    # Vite at http://localhost:5173
```

## API (base: /api)
- POST /auth/register
- POST /auth/login
- GET /auth/me
- GET/POST/PUT/DELETE /manhwa
- GET/PUT /progress/:id (manhwaId)
- GET /updates
- PUT /updates/:id/read
- PUT /updates/:id (latestChapter upsert)
- POST /admin/check-updates

## Deployment
- MongoDB Atlas: create a free cluster and whitelist IP/Network. Grab the connection string.
- Render (backend): create a Web Service from `server/`, set env `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN=https://<your-vercel-app>`, start command `npm start`.
- Vercel (frontend): deploy `frontend/`, set env `VITE_API_URL=https://<your-render-service>/api`, build command `npm run build`, output `dist`.

## Notes
- Protected routes require the `Authorization: Bearer <token>` header.
- Each record stores `userId` to enforce per-user isolation.
- If the API is unreachable, the UI falls back to animated demo data so the experience remains interactive.

## Refactor status
Phase 1 foundation is in progress:
- TypeScript baseline configs added (`tsconfig.base.json`, app-level `tsconfig.json`)
- Workspace root `package.json` with scripts and workspaces
- PWA baseline (`manifest.webmanifest`, `sw.js`) and mobile metadata
- Architecture scaffold folders for apps/shared/infrastructure/docs
