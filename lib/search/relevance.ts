import type { YouTubeChannel } from "@/types/youtube";

const EDUCATION_KEYWORDS_AR = ["مدرس", "مدرسة", "أستاذ", "معلم", "شرح", "ثانوية", "دروس", "تعليم", "منهج", "امتحان"];
const EDUCATION_KEYWORDS_EN = ["teacher", "lesson", "lecture", "tutorial", "course", "class", "explained", "curriculum", "exam", "education", "school", "learn"];

/**
 * Deterministic, keyword-based teacher-relevance estimate (0-100). Cheap
 * and fast — avoids an AI call per candidate (§22), which would be
 * wasteful for something this pattern-based.
 */
export function estimateTeacherRelevance(channel: Pick<YouTubeChannel, "title" | "description">, query: string): number {
  const haystack = `${channel.title} ${channel.description}`.toLowerCase();
  const keywords = [...EDUCATION_KEYWORDS_AR, ...EDUCATION_KEYWORDS_EN];

  let hits = 0;
  for (const kw of keywords) {
    if (haystack.includes(kw.toLowerCase())) hits++;
  }

  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  const queryHits = queryTerms.filter((t) => haystack.includes(t)).length;
  const queryMatchRatio = queryTerms.length > 0 ? queryHits / queryTerms.length : 0;

  const keywordScore = Math.min(60, hits * 12);
  const queryScore = Math.round(queryMatchRatio * 40);

  return Math.min(100, keywordScore + queryScore);
}

export function relevanceConfidenceLabel(score: number): "High confidence" | "Medium confidence" | "Low confidence" {
  if (score >= 70) return "High confidence";
  if (score >= 40) return "Medium confidence";
  return "Low confidence";
}
