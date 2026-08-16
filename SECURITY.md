# Security

## Auth & authorization

- Supabase Auth (email/password), session in httpOnly cookies via `@supabase/ssr`.
- `proxy.ts` (Next 16's middleware) is the source of truth for route protection —
  redirects unauthenticated users off every route except `/`, `/login`, `/signup`.
- Every API route re-checks `supabase.auth.getUser()` itself — never trusts
  the middleware alone, since route handlers can be hit directly.
- RLS is enabled on every user-owned table, scoped to `auth.uid()`. Frontend
  filtering is never the only protection — see `DATABASE.md`.

## Secrets

- `SUPABASE_SERVICE_ROLE_KEY` is only read in `lib/supabase/admin.ts`, which
  is marked `import "server-only"` — importing it from a Client Component is
  a build-time error.
- `YOUTUBE_API_KEY` and `ANTHROPIC_API_KEY` are only read server-side, never
  passed to the client.
- `.env*` is gitignored; `.env.local.example` documents every variable with
  no real secrets in it.

## Input validation

All API route bodies/query params are validated with Zod
(`lib/validation/`) before touching the database or an external API.

## SSRF protection

`lib/contacts/website.ts` (used for §18 website contact discovery):

- Only `http(s)` protocols allowed.
- Blocks loopback/private/link-local IP ranges and `.local` hostnames.
- Blocks non-standard ports.
- 5s timeout, 500KB response cap, only follows a fixed small set of paths
  (`/`, `/contact`, `/about`, `/courses`) — never crawls a whole site.

## Untrusted content

Per §41 of the spec, anything extracted from YouTube or a teacher's website
is treated as data, never instructions — most concretely in
`lib/ai/anthropic-provider.ts`, where the system prompt explicitly tells the
model to ignore any embedded instructions in the scraped titles/URLs it's
asked to analyze.

## Rate limiting

`lib/rate-limit/limiter.ts` — in-memory sliding window today (10
searches/5min, 20 analyses/hour per user). The `RateLimiter` interface is
designed so this can be swapped for Upstash Redis (§37) without touching
call sites — needed before running multiple server instances.

## Known gaps / follow-ups

- **Leaked password protection** (Supabase Auth setting, checks against
  HaveIBeenPwned) is currently disabled — flagged by Supabase's own security
  advisor. Enable it in Supabase Dashboard → Authentication → Policies.
- Rate limiting is per-server-instance (in-memory). Fine for a single
  deployment; move to Redis before scaling horizontally.
