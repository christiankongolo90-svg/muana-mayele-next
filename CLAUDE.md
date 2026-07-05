# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

No test framework is configured. The project uses Next.js 16 with React 19 and Tailwind CSS v4.

## Architecture

This is **Muana Mayele**, a DRC quiz app with WhatsApp OTP authentication, deployed on Vercel with Supabase (PostgreSQL). All UI text is in French.

### Stack
- **Frontend:** Next.js App Router, React 19, Tailwind CSS v4
- **Backend:** Next.js API routes (`src/app/api/`) with raw `pg` queries against Supabase PostgreSQL
- **Auth:** Phone + WhatsApp OTP via Muindatech API (no JWT/sessions — user stored in localStorage)
- **Database:** Supabase PostgreSQL (schema in `supabase-schema.sql` at the old Angular project root)

### Key Directories
- `src/app/api/_lib/` — Shared server utilities (db pool, response helpers, OTP client, settings logic, config constants)
- `src/app/api/` — 36 API route handlers following Next.js App Router convention (`route.ts` files)
- `src/components/` — 6 client components (Header, Footer, Hero, RegistrationForm, Leaderboard, HowItWorks)
- `src/lib/` — Client-side utilities: API client (`api.ts`), auth context (`auth.tsx`), quiz state context (`quiz.tsx`), countries list, DRC locations list

### State Management
- **AuthProvider** (`src/lib/auth.tsx`) — wraps the app, persists user in `localStorage` as `quiz_user`, exposes `useAuth()` hook
- **QuizProvider** (`src/lib/quiz.tsx`) — manages quiz session state (questions, score, answers), uses `elapsedRef` (MutableRef) for timer tracking

### API Patterns
- All API routes use `successResponse(data, message?)` and `errorResponse(message, statusCode)` from `_lib/helpers.ts`
- Response shape is always `{ success: boolean, data?, error?, message? }`
- Admin routes authenticate via `X-Admin-User-Id` header checked against the `users` table role column
- Database access uses a singleton `pg.Pool` from `_lib/db.ts` (connection string from `SUPABASE_DB_URL` or `POSTGRES_URL` env var)
- The client-side API wrapper (`src/lib/api.ts`) handles JSON/FormData and error extraction

### Quiz Logic
- Questions are selected with weighted difficulty: 20% easy, 40% medium, 40% hard
- Previously answered questions are excluded per user (resets when pool is exhausted)
- Quiz access respects schedule (days + time window in configured timezone) — see `_lib/settings.ts` → `getAccessStatus()`
- Points: 50 per correct answer (`POINTS_PER_CORRECT` in `_lib/config.ts`)

### Environment Variables (Vercel)
- `SUPABASE_DB_URL` / `POSTGRES_URL` — PostgreSQL connection string
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — for Supabase Storage (image uploads)
- `MUINDA_API_KEY`, `MUINDA_API_BASE_URL`, `MUINDA_OTP_TEMPLATE`, `MUINDA_OTP_LANGUAGE` — WhatsApp OTP service

### Deployment
Push to `master` branch. Vercel auto-deploys. The project is linked to the `muanumayele/muana-mayele` Vercel project. Manual deploy: `npx vercel --prod`.
