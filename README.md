# Nova Scrolls

Nova Scrolls is a futuristic manhwa tracker with a mobile-first, neon space dashboard. Users can register, log in, track their library, monitor unread chapter drops, and manage progress with smooth Framer Motion animations.

## Stack
- Frontend: React (Vite), TailwindCSS, Framer Motion, React Router, Axios
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

## Project structure
```
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
  controllers/ middleware/ models/ routes/ database/ utils/
  server.js
  .env.example
```

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

## Deployment
- MongoDB Atlas: create a free cluster and whitelist IP/Network. Grab the connection string.
- Render (backend): create a Web Service from `server/`, set env `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN=https://<your-vercel-app>`, start command `npm start`.
- Vercel (frontend): deploy `frontend/`, set env `VITE_API_URL=https://<your-render-service>/api`, build command `npm run build`, output `dist`.

## Notes
- Protected routes require the `Authorization: Bearer <token>` header.
- Each record stores `userId` to enforce per-user isolation.
- If the API is unreachable, the UI falls back to animated demo data so the experience remains interactive.
