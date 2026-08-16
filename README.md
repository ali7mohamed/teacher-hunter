# Teacher Hunter

Lead-discovery tool for finding teacher/educational YouTube creators as
thumbnail-design clients. All 14 phases from the product spec are
implemented — see `ARCHITECTURE.md`, `DATABASE.md`, `API.md`,
`SECURITY.md`, `YOUTUBE.md` for details on each part.

## Setup

```bash
npm install
cp .env.local.example .env.local   # already pre-filled with this project's Supabase URL/anon key
npm run dev
```

### Environment variables

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Already filled in — pulled from your connected Supabase project. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API. Server-only. |
| `YOUTUBE_API_KEY` | See `YOUTUBE.md` — required for search to return real results. |
| `ANTHROPIC_API_KEY` | console.anthropic.com. Required for thumbnail-opportunity analysis. |

Without the last two keys, the app still runs — auth, the dashboard, leads
CRUD, CRM, and CSV export all work. Search and thumbnail analysis will
return a clear "not available right now" error until the keys are added.

## Commands

```bash
npm run dev          # local dev server
npm run lint          # ESLint
npx tsc --noEmit      # typecheck
npm test              # vitest unit tests
npm run build          # production build
```

All four currently pass clean: 0 lint warnings, 0 type errors, 24/24 tests,
successful build.

## Project structure

See `ARCHITECTURE.md` for the full breakdown. Quick map:

```
app/(auth)/          login, signup, server actions
app/dashboard/        overview, search, leads, leads/[id], saved, analytics, settings
app/api/              search, leads, leads/[id], leads/[id]/analyze, export
components/ui/        hand-written shadcn-style primitives
components/leads/     lead table, card, priority badge, contact badges
lib/youtube/          YouTube Data API v3 client + cache
lib/search/           query expansion, relevance, full search pipeline
lib/contacts/         contact extraction, phone normalization, website discovery
lib/scoring/          the 100-point lead scoring model
lib/deduplication/    channel-id dedup
lib/ai/               AIProvider interface + Anthropic implementation
lib/rate-limit/       rate limiter abstraction
tests/                vitest unit tests (scoring, contacts, dedup, query expansion, validation)
```

### Database migrations

Applied directly to the connected Supabase project. To pull a local,
version-controlled copy:

```bash
npx supabase login
npx supabase link --project-ref cplpfmlleteaclbqeeao
npx supabase db pull
```
