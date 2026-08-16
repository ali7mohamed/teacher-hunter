# Database

Postgres via Supabase. All migrations were applied directly to the connected
project (`cplpfmlleteaclbqeeao`) through the Supabase MCP tool. To get a
local, version-controlled copy:

```bash
npx supabase login
npx supabase link --project-ref cplpfmlleteaclbqeeao
npx supabase db pull
```

## Tables

| Table | Purpose | RLS |
|---|---|---|
| `profiles` | 1:1 with `auth.users`, auto-created on signup | owner only |
| `searches` | History of searches a user has run | owner only |
| `leads` | The core entity — one row per (user, YouTube channel) | owner only |
| `lead_sources` | Where a piece of lead data came from | via parent lead |
| `lead_status_history` | Auto-logged on every status change (trigger) | via parent lead, read-only |
| `youtube_channel_cache` | Shared cache of `channels.list` responses (6h TTL) | authenticated read |
| `youtube_video_cache` | Shared cache of recent videos per channel (3h TTL) | authenticated read |
| `thumbnail_analysis_cache` | Cached AI thumbnail analysis, keyed by channel + video-set hash | authenticated read |

`leads` has a unique constraint on `(user_id, youtube_channel_id)` — this is
the primary dedup mechanism at the database layer, on top of the in-memory
dedup in `lib/deduplication/dedupe.ts`.

## Triggers

- `set_updated_at` on `profiles` and `leads`
- `handle_new_user` — inserts a `profiles` row when a user signs up (not
  callable directly via RPC; only fires as an `auth.users` trigger)
- `log_lead_status_change` — writes to `lead_status_history` whenever
  `leads.status` changes

## RLS

Every user-owned table has RLS enabled, scoped with `auth.uid() = user_id`
(directly or via the parent `leads` row). The cache tables are shared
(non-user-owned public YouTube/AI data) and are written only by the
service-role client (`lib/supabase/admin.ts`), never by user-facing code.
