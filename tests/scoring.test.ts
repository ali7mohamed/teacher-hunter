import { describe, it, expect } from "vitest";
import { scoreAudience } from "@/lib/scoring/audience";
import { scoreActivity } from "@/lib/scoring/activity";
import { scoreContact } from "@/lib/scoring/contact";
import { scoreLead } from "@/lib/scoring";

describe("scoreAudience", () => {
  it("returns 0 for unavailable subscriber counts — never estimated", () => {
    expect(scoreAudience(null)).toBe(0);
  });
  it("scores each band correctly", () => {
    expect(scoreAudience(500)).toBe(5);
    expect(scoreAudience(5_000)).toBe(10);
    expect(scoreAudience(20_000)).toBe(18);
    expect(scoreAudience(75_000)).toBe(22);
    expect(scoreAudience(200_000)).toBe(27);
    expect(scoreAudience(1_000_000)).toBe(30);
  });
});

describe("scoreActivity", () => {
  it("returns 0 with no last video", () => {
    expect(scoreActivity(null)).toBe(0);
  });
  it("scores recent activity highest", () => {
    const now = new Date();
    expect(scoreActivity(new Date(now.getTime() - 2 * 86400000))).toBe(20);
    expect(scoreActivity(new Date(now.getTime() - 20 * 86400000))).toBe(16);
    expect(scoreActivity(new Date(now.getTime() - 60 * 86400000))).toBe(10);
    expect(scoreActivity(new Date(now.getTime() - 150 * 86400000))).toBe(5);
    expect(scoreActivity(new Date(now.getTime() - 300 * 86400000))).toBe(0);
  });
});

describe("scoreContact", () => {
  it("caps at 20 and never double-counts", () => {
    expect(
      scoreContact([
        { type: "whatsapp", value: "+201012345678", source: "x", confidence: "high" },
        { type: "email", value: "a@b.com", source: "x", confidence: "high" },
      ])
    ).toBe(20);
  });
  it("falls through priority order", () => {
    expect(scoreContact([{ type: "email", value: "a@b.com", source: "x", confidence: "high" }])).toBe(12);
    expect(scoreContact([{ type: "website", value: "https://x.com", source: "x", confidence: "medium" }])).toBe(5);
    expect(scoreContact([])).toBe(0);
  });
});

describe("scoreLead", () => {
  it("sums to a valid 0-100 breakdown", () => {
    const { leadScore, breakdown } = scoreLead({
      subscriberCount: 200_000,
      lastVideoAt: new Date(),
      teacherRelevance: 90,
      contacts: [{ type: "whatsapp", value: "+201012345678", source: "x", confidence: "high" }],
      thumbnailOpportunity: { score: 80, strengths: [], weaknesses: [], opportunities: [] },
    });
    expect(leadScore).toBeGreaterThan(0);
    expect(leadScore).toBeLessThanOrEqual(100);
    expect(breakdown.audience + breakdown.activity + breakdown.teacherRelevance + breakdown.contact + breakdown.thumbnailOpportunity).toBe(leadScore);
  });
});
