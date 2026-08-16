import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { leadIdSchema } from "@/lib/validation/search";
import { youtube } from "@/lib/youtube";
import { aiProvider } from "@/lib/ai";
import { scoreLead } from "@/lib/scoring";
import { analyzeRateLimiter } from "@/lib/rate-limit/limiter";
import crypto from "node:crypto";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!leadIdSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid lead id." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = await analyzeRateLimiter.check(user.id);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Thumbnail analysis limit reached. Please try again later." }, { status: 429 });
  }

  const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).eq("user_id", user.id).single();
  if (error || !lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  try {
    const videos = await youtube.getRecentVideos(lead.youtube_channel_id, 10);
    if (videos.length === 0) {
      return NextResponse.json({ error: "No recent videos available to analyze." }, { status: 422 });
    }

    const videoIdsHash = crypto.createHash("sha256").update(videos.map((v) => v.videoId).join(",")).digest("hex");

    const admin = createAdminClient();
    const { data: cached } = await admin
      .from("thumbnail_analysis_cache")
      .select("analysis, video_ids_hash, fetched_at")
      .eq("channel_id", lead.youtube_channel_id)
      .maybeSingle();

    let analysis: import("@/types/scoring").ThumbnailAnalysis;
    const cacheFresh = cached && cached.video_ids_hash === videoIdsHash && Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS;

    if (cacheFresh) {
      analysis = cached.analysis as unknown as import("@/types/scoring").ThumbnailAnalysis;
    } else {
      analysis = await aiProvider.analyzeThumbnails({
        channelTitle: lead.youtube_title ?? lead.name ?? "Unknown channel",
        videos: videos.map((v) => ({ title: v.title, thumbnailUrl: v.thumbnailUrl })),
      });
      await admin.from("thumbnail_analysis_cache").upsert({
        channel_id: lead.youtube_channel_id,
        video_ids_hash: videoIdsHash,
        analysis: analysis as never,
        fetched_at: new Date().toISOString(),
      });
    }

    const { breakdown } = scoreLead({
      subscriberCount: lead.subscriber_count,
      lastVideoAt: lead.last_video_at,
      teacherRelevance: lead.teacher_relevance_score ?? 0,
      contacts: [],
      thumbnailOpportunity: analysis,
    });
    // Preserve the contact score already stored (contacts aren't recomputed here).
    breakdown.contact = lead.contact_score ?? breakdown.contact;
    const finalScore = breakdown.audience + breakdown.activity + breakdown.teacherRelevance + breakdown.contact + breakdown.thumbnailOpportunity;

    const { data: updated } = await supabase
      .from("leads")
      .update({
        thumbnail_opportunity_score: analysis.score,
        lead_score: finalScore,
        score_breakdown: breakdown,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    return NextResponse.json({ analysis, lead: updated ?? lead });
  } catch (err) {
    console.error("thumbnail analysis error", err);
    return NextResponse.json({ error: "Thumbnail analysis is unavailable right now." }, { status: 502 });
  }
}
