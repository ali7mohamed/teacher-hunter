# API

All routes require an authenticated Supabase session (cookie-based). Unauthenticated
requests get `401`.

## POST /api/search

Runs the full search pipeline, persists results as leads, returns them.

```json
// request
{ "query": "مدرس عربي ثانوية عامة مصر", "filters": { "minSubscribers": 10000 } }

// response
{ "results": [ /* Lead rows, id included */ ], "meta": { "count": 12 } }
```

Rate limited to 10 requests / 5 minutes per user. Returns `429` when exceeded,
`503` when the YouTube API quota itself is exhausted, `502` for other YouTube
API failures.

## GET /api/leads

Query params: `page` (default 1), `limit` (default 20, max 100), `status`,
`minScore`, `search`. Returns `{ results, meta: { count, page, limit } }`.

## GET /api/leads/:id

Returns `{ lead, sources, statusHistory }`.

## PATCH /api/leads/:id

Body: `{ status?, notes? }`. Returns `{ lead }`.

## DELETE /api/leads/:id

Returns `{ success: true }`.

## POST /api/leads/:id/analyze

Runs (or returns cached) thumbnail-opportunity analysis for the lead's
recent videos, updates `thumbnail_opportunity_score` and `lead_score`.
Rate limited to 20 requests / hour per user. Returns `{ analysis, lead }`.

## GET /api/export

Streams a CSV of all the user's leads. `Content-Disposition: attachment`.
