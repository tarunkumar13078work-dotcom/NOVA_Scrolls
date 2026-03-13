# NOVA Scrolls Architecture (Phase 1 Foundation)

## Current Runtime
- Frontend runtime: `frontend/`
- Backend runtime: `server/`

## Target Layout
- `apps/web-mobile`
- `apps/web-desktop`
- `shared/types`, `shared/constants`, `shared/helpers`
- `server` with clean architecture layers
- `infrastructure/docker`, `infrastructure/deployment`
- `docs`

## Migration Principle
Adopt incremental migration to avoid feature regressions while introducing TypeScript and scalable architecture.

## Implemented Foundations
- TanStack Query is wired at app root for cached server state and background refetch behavior.
- Data provider uses query and mutation primitives for manhwa/progress/update operations.
- Dashboard includes debounced search and virtualization for large libraries.
- PWA shell includes manifest, service worker, and install-ready metadata.
- Offline queue persists progress and favorite mutations, then flushes when connectivity returns.
- Mobile gestures are wired in cards: swipe right mark read, swipe left reveal details, long-press chapter edit focus.
- Profile includes JSON/CSV export and JSON/CSV import for library backups.
- Server includes a cron-based multi-source update engine (Asura/Reaper/Flame) to detect chapter changes and push notifications.
- Desktop support includes global keyboard shortcuts and drag-drop backup import.
- AI endpoints provide URL metadata autofill, recommendation ranking, and reading finish predictions.
- AI services support optional provider-backed enhancement with resilient local heuristic fallback.
- Core frontend modules migrated to TypeScript: auth/data/toast contexts and hooks, local/offline/push/API services, query client, debounce/PWA/shortcut hooks.
- Header integrates `beforeinstallprompt` flow for Add-to-Home-Screen install UX.
- App root is wrapped in a React error boundary to provide a crash-safe fallback view.
