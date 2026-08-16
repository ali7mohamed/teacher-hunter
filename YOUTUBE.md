# YouTube Integration

## Getting an API key

1. https://console.cloud.google.com → create/select a project.
2. APIs & Services → Library → enable **YouTube Data API v3**.
3. APIs & Services → Credentials → Create Credentials → API Key.
4. (Recommended) Restrict the key to YouTube Data API v3 only.
5. Put it in `.env.local` as `YOUTUBE_API_KEY`.

No OAuth needed — every call this app makes is public, read-only data
(`search.list`, `channels.list`, `playlistItems.list`, `videos.list`).

## Quota

The free tier is 10,000 units/day. Approximate costs per call:

| Call | Cost |
|---|---|
| `search.list` | 100 units |
| `channels.list` | 1 unit |
| `playlistItems.list` | 1 unit |
| `videos.list` | 1 unit |

A single user search expands into up to 5 queries (`lib/search/query-expansion.ts`,
capped per §8), each a `search.list` call — so one search can cost up to
~500 units before any per-channel calls. Deep analysis (channel details +
recent videos) only runs for the top ~20 relevant candidates (§19), not
every search result.

## Where quota control happens

- `lib/youtube/index.ts` checks the Supabase cache (`youtube_channel_cache`,
  `youtube_video_cache`) before calling the real API — 6h/3h TTLs.
- `lib/search/run-search.ts` filters candidates by a cheap, deterministic
  relevance score (`estimateTeacherRelevance`) *before* calling
  `getChannel`/`getRecentVideos`, so irrelevant search hits never cost
  channel/video quota.
- `getRecentVideos` fetches via the channel's uploads playlist (1 unit),
  not `search.list` (100 units), and caps at 15–20 videos.

## Error handling

`lib/youtube/errors.ts` distinguishes quota exhaustion
(`YouTubeQuotaExceededError`) from other API failures
(`YouTubeApiError`). `/api/search` maps these to a `503` with the
message "YouTube search quota has been reached. Please try again later."
— never a raw Google error string.
