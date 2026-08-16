/** Lead scoring model — mirrors the 100-point breakdown in the product spec. */

export interface ScoreBreakdown {
  [key: string]: number;
  audience: number; // 0-30
  activity: number; // 0-20
  teacherRelevance: number; // 0-15
  contact: number; // 0-20
  thumbnailOpportunity: number; // 0-15
}

export interface ContactInfo {
  type: "whatsapp" | "phone" | "email" | "website";
  value: string;
  source: string;
  confidence: "high" | "medium" | "low";
}

export interface ThumbnailAnalysis {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}
