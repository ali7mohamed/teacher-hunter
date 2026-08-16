import type { Tables } from "@/types/database";

export type Lead = Tables<"leads">;
export type LeadSource = Tables<"lead_sources">;
export type LeadStatusHistoryEntry = Tables<"lead_status_history">;

export type LeadStatus =
  | "new"
  | "contacted"
  | "replied"
  | "negotiating"
  | "client"
  | "rejected";

export type ContactConfidence = "high" | "medium" | "low";

export type LeadSourceType =
  | "youtube_channel"
  | "youtube_video"
  | "website"
  | "contact_page"
  | "search";

/** Priority label shown next to a lead, derived from lead_score. */
export type LeadPriorityLabel = "Hot Lead" | "Strong Lead" | "Good Lead" | "Low Priority";

export function leadPriorityLabel(score: number | null): LeadPriorityLabel {
  if (score === null) return "Low Priority";
  if (score >= 90) return "Hot Lead";
  if (score >= 75) return "Strong Lead";
  if (score >= 60) return "Good Lead";
  return "Low Priority";
}
