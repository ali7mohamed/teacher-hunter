/** Shapes returned by the YouTube Data API integration (lib/youtube). */

export interface YouTubeChannelCandidate {
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
}

export interface YouTubeChannel {
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  /** null when hidden by the channel owner — never estimated. */
  subscriberCount: number | null;
  videoCount: number | null;
  viewCount: number | null;
  country: string | null;
  customUrl: string | null;
  url: string;
}

export interface YouTubeVideo {
  videoId: string;
  channelId: string;
  title: string;
  description: string;
  publishedAt: string;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  thumbnailUrl: string | null;
  url: string;
}

export interface YouTubeProvider {
  searchChannels(query: string): Promise<YouTubeChannelCandidate[]>;
  getChannel(channelId: string): Promise<YouTubeChannel | null>;
  getRecentVideos(channelId: string, limit?: number): Promise<YouTubeVideo[]>;
}
