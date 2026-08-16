import "server-only";
import type {
  YouTubeChannel,
  YouTubeChannelCandidate,
  YouTubeProvider,
  YouTubeVideo,
} from "@/types/youtube";
import { YouTubeApiError, YouTubeQuotaExceededError } from "./errors";

const BASE_URL = "https://www.googleapis.com/youtube/v3";
/** Recent-videos default cap — §11: 10-20, never hundreds. */
const DEFAULT_RECENT_VIDEO_LIMIT = 15;

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new YouTubeApiError(
      "YOUTUBE_API_KEY is not configured. Add it to your environment to enable YouTube search."
    );
  }
  return key;
}

async function callYouTube<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}/${path}`);
  url.searchParams.set("key", getApiKey());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const reason = body?.error?.errors?.[0]?.reason;
    if (res.status === 403 && (reason === "quotaExceeded" || reason === "dailyLimitExceeded")) {
      throw new YouTubeQuotaExceededError();
    }
    throw new YouTubeApiError(body?.error?.message ?? `YouTube API request failed (${res.status})`, res.status);
  }

  return res.json() as Promise<T>;
}

interface YTSearchListResponse {
  items: Array<{ id: { channelId?: string }; snippet: { title: string; description: string; thumbnails?: { default?: { url: string } } } }>;
}

interface YTChannelListResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails?: { default?: { url: string }; medium?: { url: string } };
      country?: string;
      customUrl?: string;
    };
    statistics: {
      subscriberCount?: string;
      hiddenSubscriberCount?: boolean;
      videoCount?: string;
      viewCount?: string;
    };
  }>;
}

interface YTPlaylistItemsResponse {
  items: Array<{ contentDetails: { videoId: string; videoPublishedAt?: string } }>;
  nextPageToken?: string;
}

interface YTVideoListResponse {
  items: Array<{
    id: string;
    snippet: { title: string; description: string; publishedAt: string; channelId: string; thumbnails?: { medium?: { url: string } } };
    statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
  }>;
}

/**
 * Real YouTube Data API v3 integration. Centralizes every call to the API —
 * nothing outside this file should hit googleapis.com directly (§9, §33).
 * Read-only, uses only an API key — no OAuth, no write scopes.
 */
export class YouTubeApiProvider implements YouTubeProvider {
  async searchChannels(query: string): Promise<YouTubeChannelCandidate[]> {
    const data = await callYouTube<YTSearchListResponse>("search", {
      part: "snippet",
      type: "channel",
      q: query,
      maxResults: "25",
      relevanceLanguage: detectLanguage(query),
    });

    return data.items
      .filter((item) => item.id.channelId)
      .map((item) => ({
        channelId: item.id.channelId!,
        title: item.snippet.title,
        description: item.snippet.description ?? "",
        thumbnailUrl: item.snippet.thumbnails?.default?.url ?? null,
      }));
  }

  async getChannel(channelId: string): Promise<YouTubeChannel | null> {
    const data = await callYouTube<YTChannelListResponse>("channels", {
      part: "snippet,statistics",
      id: channelId,
    });

    const item = data.items[0];
    if (!item) return null;

    return {
      channelId: item.id,
      title: item.snippet.title,
      description: item.snippet.description ?? "",
      thumbnailUrl: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? null,
      publishedAt: item.snippet.publishedAt ?? null,
      subscriberCount: item.statistics.hiddenSubscriberCount ? null : parseIntOrNull(item.statistics.subscriberCount),
      videoCount: parseIntOrNull(item.statistics.videoCount),
      viewCount: parseIntOrNull(item.statistics.viewCount),
      country: item.snippet.country ?? null,
      customUrl: item.snippet.customUrl ?? null,
      url: item.snippet.customUrl ? `https://www.youtube.com/${item.snippet.customUrl}` : `https://www.youtube.com/channel/${item.id}`,
    };
  }

  async getRecentVideos(channelId: string, limit = DEFAULT_RECENT_VIDEO_LIMIT): Promise<YouTubeVideo[]> {
    const uploadsPlaylistId = "UU" + channelId.slice(2);

    const playlistData = await callYouTube<YTPlaylistItemsResponse>("playlistItems", {
      part: "contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: String(Math.min(limit, 20)),
    });

    const videoIds = playlistData.items.map((i) => i.contentDetails.videoId).filter(Boolean);
    if (videoIds.length === 0) return [];

    const videosData = await callYouTube<YTVideoListResponse>("videos", {
      part: "snippet,statistics",
      id: videoIds.join(","),
    });

    return videosData.items.map((item) => ({
      videoId: item.id,
      channelId: item.snippet.channelId,
      title: item.snippet.title,
      description: item.snippet.description ?? "",
      publishedAt: item.snippet.publishedAt,
      viewCount: parseIntOrNull(item.statistics.viewCount),
      likeCount: parseIntOrNull(item.statistics.likeCount),
      commentCount: parseIntOrNull(item.statistics.commentCount),
      thumbnailUrl: item.snippet.thumbnails?.medium?.url ?? null,
      url: `https://www.youtube.com/watch?v=${item.id}`,
    }));
  }
}

function parseIntOrNull(value: string | undefined): number | null {
  if (value === undefined) return null;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function detectLanguage(query: string): string {
  return /[\u0600-\u06FF]/.test(query) ? "ar" : "en";
}
