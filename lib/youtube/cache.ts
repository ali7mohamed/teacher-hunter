import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { YouTubeChannel, YouTubeVideo } from "@/types/youtube";

const CHANNEL_TTL_MS = 6 * 60 * 60 * 1000;
const VIDEO_TTL_MS = 3 * 60 * 60 * 1000;

export async function getCachedChannel(channelId: string): Promise<YouTubeChannel | null> {
  const db = createAdminClient();
  const { data } = await db.from("youtube_channel_cache").select("data, fetched_at").eq("channel_id", channelId).maybeSingle();
  if (!data) return null;
  if (Date.now() - new Date(data.fetched_at).getTime() > CHANNEL_TTL_MS) return null;
  return data.data as unknown as YouTubeChannel;
}

export async function setCachedChannel(channelId: string, channel: YouTubeChannel) {
  const db = createAdminClient();
  await db.from("youtube_channel_cache").upsert({ channel_id: channelId, data: channel as never, fetched_at: new Date().toISOString() });
}

export async function getCachedVideos(channelId: string): Promise<YouTubeVideo[] | null> {
  const db = createAdminClient();
  const { data } = await db.from("youtube_video_cache").select("videos, fetched_at").eq("channel_id", channelId).maybeSingle();
  if (!data) return null;
  if (Date.now() - new Date(data.fetched_at).getTime() > VIDEO_TTL_MS) return null;
  return data.videos as unknown as YouTubeVideo[];
}

export async function setCachedVideos(channelId: string, videos: YouTubeVideo[]) {
  const db = createAdminClient();
  await db.from("youtube_video_cache").upsert({ channel_id: channelId, videos: videos as never, fetched_at: new Date().toISOString() });
}
