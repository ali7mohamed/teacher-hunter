# Architecture

## Layers

```
app/            Routes (App Router) — pages + API routes. No business logic here.
components/     UI only. ui/ = primitives, dashboard/leads/search = feature components.
lib/            All business logic, centralized by domain:
  youtube/        YouTube Data API v3 client + cache (only place that calls googleapis.com)
  contacts/       Deterministic contact extraction, phone/URL normalization, website discovery
  search/         Query expansion, teacher-relevance heuristic, full search pipeline
  scoring/        The 100-point lead scoring model
  deduplication/  Channel-id based dedupe
  ai/             AIProvider interface + Anthropic implementation (thumbnail analysis only)
  rate-limit/     Rate limiter abstraction (in-memory now, swappable for Upstash Redis)
  supabase/       Browser/server/admin clients + session middleware
  validation/     Zod schemas
types/          Shared TypeScript types (generated DB types + domain types)
```

## Search pipeline (§7 of the spec)

`lib/search/run-search.ts` orchestrates:

```
expandSearchQuery → youtube.searchChannels (per expanded query)
  → dedupeByChannelId
  → estimateTeacherRelevance (cheap, deterministic — filters obviously irrelevant results)
  → youtube.getChannel (only for the top N relevant candidates)
  → youtube.getRecentVideos
  → extractContacts (+ discoverWebsiteContacts if a website was found)
  → scoreLead
  → sort by lead_score desc
```

This mirrors §18/§19 of the spec: cheap filtering happens before any expensive
per-channel API calls or website fetches.

## Why AI is optional and isolated

`lib/ai/provider.ts` defines `AIProvider` with one method,
`analyzeThumbnails`. The only implementation is Anthropic-backed
(`anthropic-provider.ts`), but nothing else in the app imports Anthropic
directly — swapping providers means implementing the interface and changing
one line in `lib/ai/index.ts`.

Nothing else in the pipeline calls an AI model. Teacher relevance,
deduplication, phone/URL normalization, and contact extraction are all
plain deterministic code (§22 of the credit-conservation rules).

## Caching (§20, §38)

- `youtube_channel_cache` / `youtube_video_cache`: 6h / 3h TTL, read via the
  service-role client so RLS doesn't block cross-user cache sharing (the data
  is public YouTube info, not user-owned).
- `thumbnail_analysis_cache`: keyed by channel + a hash of the analyzed video
  IDs, so a re-analysis only happens if the top videos actually changed.

## What's stubbed vs. real

Everything is real, working code — but two things need external credentials
you provide:

- `YOUTUBE_API_KEY` — without it, `lib/youtube/api-provider.ts` throws a
  clear error (surfaced to the user as "YouTube search is not available
  right now").
- `ANTHROPIC_API_KEY` — same pattern for thumbnail analysis.

Everything else (auth, database, scoring, dedup, contact extraction, CRM,
export) works with zero external keys beyond Supabase.
