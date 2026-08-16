import type { ScoreBreakdown, ContactInfo, ThumbnailAnalysis } from "@/types/scoring";
import { scoreAudience } from "./audience";
import { scoreActivity } from "./activity";
import { scoreContact } from "./contact";

export { scoreAudience, scoreActivity, scoreContact };
export { activityLabel } from "./activity";

export interface ScoreLeadInput {
  subscriberCount: number | null;
  lastVideoAt: string | Date | null;
  teacherRelevance: number; // 0-100, scaled to 15 internally
  contacts: ContactInfo[];
  thumbnailOpportunity: ThumbnailAnalysis | null; // 0-100, scaled to 15 internally
}

export interface ScoreLeadResult {
  leadScore: number;
  breakdown: ScoreBreakdown;
}

/** §22-23: full 100-point lead score with breakdown, ready to explain. */
export function scoreLead(input: ScoreLeadInput): ScoreLeadResult {
  const audience = scoreAudience(input.subscriberCount);
  const activity = scoreActivity(input.lastVideoAt);
  const teacherRelevance = Math.round((input.teacherRelevance / 100) * 15);
  const contact = scoreContact(input.contacts);
  const thumbnailOpportunity = input.thumbnailOpportunity
    ? Math.round((input.thumbnailOpportunity.score / 100) * 15)
    : 0;

  const breakdown: ScoreBreakdown = { audience, activity, teacherRelevance, contact, thumbnailOpportunity };
  const leadScore = audience + activity + teacherRelevance + contact + thumbnailOpportunity;

  return { leadScore, breakdown };
}
