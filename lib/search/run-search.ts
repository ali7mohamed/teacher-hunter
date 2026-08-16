import "server-only";
import { youtube } from "@/lib/youtube";
import { expandSearchQuery } from "./query-expansion";
import { estimateTeacherRelevance } from "./relevance";
import { dedupeByChannelId } from "@/lib/deduplication/dedupe";
import { extractContacts, pickPrimaryContact } from "@/lib/contacts/extract";
import { discoverWebsiteContacts } from "@/lib/contacts/website";
import { scoreLead } from "@/lib/scoring";
import type { SearchFilters } from "@/types/search";
import type { ContactInfo } from "@/types/scoring";
import { YouTubeQuotaExceededError } from "@/lib/youtube/errors";

const RELEVANCE_FLOOR = 25; // §18: reject clearly-irrelevant candidates before deep analysis
const DEEP_ANALYSIS_LIMIT = 20; // §19: only the top N get contact discovery + video fetch

export interface RankedLead {
  channelId: string;
  name: string;
  youtubeUrl: string;
  youtubeTitle: string;
  youtubeDescription: string;
  youtubeThumbnailUrl: string | null;
  subscriberCount: number | null;
  videoCount: number | null;
  totalViewCount: number | null;
  lastVideoAt: string | null;
  averageRecentViews: number | null;
  teacherRelevanceScore: number;
  contacts: ContactInfo[];
  leadScore: number;
  scoreBreakdown: ReturnType<typeof scoreLead>["breakdown"];
}

/**
 * Full search pipeline (§7): expand query → YouTube search → candidate
 * filtering → deep analysis on top candidates only → score → rank.
 */
export async function runSearch(query: string, filters?: SearchFilters): Promise<RankedLead[]> {
  const expandedQueries = expandSearchQuery(query);

  const candidateBatches = await Promise.all(expandedQueries.map((q) => youtube.searchChannels(q)));
  const candidates = dedupeByChannelId(candidateBatches.flat());

  // Early relevance filter before any expensive per-channel calls (§18).
  const relevant = candidates
    .map((c) => ({ candidate: c, relevance: estimateTeacherRelevance(c, query) }))
    .filter((c) => c.relevance >= RELEVANCE_FLOOR)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, DEEP_ANALYSIS_LIMIT);

  const leads: RankedLead[] = [];

  for (const { candidate, relevance } of relevant) {
    let channel;
    try {
      channel = await youtube.getChannel(candidate.channelId);
    } catch (err) {
      if (err instanceof YouTubeQuotaExceededError) throw err;
      continue;
    }
    if (!channel) continue;

    if (filters?.minSubscribers && (channel.subscriberCount ?? 0) < filters.minSubscribers) continue;

    const videos = await youtube.getRecentVideos(channel.channelId).catch(() => []);
    const lastVideoAt = videos[0]?.publishedAt ?? null;
    const averageRecentViews = videos.length
      ? Math.round(videos.reduce((sum, v) => sum + (v.viewCount ?? 0), 0) / videos.length)
      : null;

    const descriptionText = [channel.description, ...videos.slice(0, 5).map((v) => v.description)].join("\n");
    let contacts = extractContacts(descriptionText, channel.url);

    const website = pickPrimaryContact(contacts.filter((c) => c.type === "website"))?.value;
    if (website) {
      const websiteContacts = await discoverWebsiteContacts(website).catch(() => []);
      contacts = [...contacts, ...websiteContacts];
    }

    const { leadScore, breakdown } = scoreLead({
      subscriberCount: channel.subscriberCount,
      lastVideoAt,
      teacherRelevance: relevance,
      contacts,
      thumbnailOpportunity: null, // computed on demand via /api/leads/[id]/analyze (§10, §24: don't auto-run AI for every result)
    });

    leads.push({
      channelId: channel.channelId,
      name: channel.title,
      youtubeUrl: channel.url,
      youtubeTitle: channel.title,
      youtubeDescription: channel.description,
      youtubeThumbnailUrl: channel.thumbnailUrl,
      subscriberCount: channel.subscriberCount,
      videoCount: channel.videoCount,
      totalViewCount: channel.viewCount,
      lastVideoAt,
      averageRecentViews,
      teacherRelevanceScore: relevance,
      contacts,
      leadScore,
      scoreBreakdown: breakdown,
    });
  }

  return leads.sort((a, b) => b.leadScore - a.leadScore);
}
