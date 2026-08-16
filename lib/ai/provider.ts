import type { ThumbnailAnalysis } from "@/types/scoring";

export interface ThumbnailInput {
  channelTitle: string;
  /** Untrusted data — video titles/thumbnail URLs scraped from YouTube (§41). */
  videos: Array<{ title: string; thumbnailUrl: string | null }>;
}

/** §42: AI is decoupled from any single vendor. Swap providers without touching callers. */
export interface AIProvider {
  analyzeThumbnails(input: ThumbnailInput): Promise<ThumbnailAnalysis>;
}
