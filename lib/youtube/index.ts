import "server-only";
import type { YouTubeChannel, YouTubeProvider, YouTubeVideo } from "@/types/youtube";
import { YouTubeApiProvider } from "./api-provider";
import { getCachedChannel, getCachedVideos, setCachedChannel, setCachedVideos } from "./cache";

const provider: YouTubeProvider = new YouTubeApiProvider();

/** Quota-aware wrapper — always check cache before hitting the real API (§20, §38). */
export const youtube = {
  searchChannels: (query: string) => provider.searchChannels(query),

  async getChannel(channelId: string): Promise<YouTubeChannel | null> {
    const cached = await getCachedChannel(channelId);
    if (cached) return cached;
    const fresh = await provider.getChannel(channelId);
    if (fresh) await setCachedChannel(channelId, fresh);
    return fresh;
  },

  async getRecentVideos(channelId: string, limit?: number): Promise<YouTubeVideo[]> {
    const cached = await getCachedVideos(channelId);
    if (cached) return cached;
    const fresh = await provider.getRecentVideos(channelId, limit);
    await setCachedVideos(channelId, fresh);
    return fresh;
  },
};
