import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchRequestSchema } from "@/lib/validation/search";
import { runSearch } from "@/lib/search/run-search";
import { searchRateLimiter } from "@/lib/rate-limit/limiter";
import { YouTubeQuotaExceededError, YouTubeApiError } from "@/lib/youtube/errors";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = await searchRateLimiter.check(user.id);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "You're searching too often. Please wait a few minutes and try again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = searchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search request.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const results = await runSearch(parsed.data.query, parsed.data.filters);

    await supabase.from("searches").insert({
      user_id: user.id,
      query: parsed.data.query,
      filters: parsed.data.filters ?? {},
      results_count: results.length,
    });

    let savedLeads: unknown[] = [];
    if (results.length > 0) {
      const rows = results.map((lead) => ({
        user_id: user.id,
        name: lead.name,
        youtube_channel_id: lead.channelId,
        youtube_url: lead.youtubeUrl,
        youtube_title: lead.youtubeTitle,
        youtube_description: lead.youtubeDescription,
        youtube_thumbnail_url: lead.youtubeThumbnailUrl,
        subscriber_count: lead.subscriberCount,
        video_count: lead.videoCount,
        total_view_count: lead.totalViewCount,
        last_video_at: lead.lastVideoAt,
        average_recent_views: lead.averageRecentViews,
        teacher_relevance_score: lead.teacherRelevanceScore,
        contact_score: lead.scoreBreakdown.contact,
        lead_score: lead.leadScore,
        score_breakdown: lead.scoreBreakdown,
        business_whatsapp: lead.contacts.find((c) => c.type === "whatsapp")?.value ?? null,
        business_phone: lead.contacts.find((c) => c.type === "phone")?.value ?? null,
        business_email: lead.contacts.find((c) => c.type === "email")?.value ?? null,
        website_url: lead.contacts.find((c) => c.type === "website")?.value ?? null,
        contact_source_url: lead.contacts[0]?.source ?? null,
        contact_confidence: lead.contacts[0]?.confidence ?? null,
      }));

      const { data: upserted } = await supabase
        .from("leads")
        .upsert(rows, { onConflict: "user_id,youtube_channel_id" })
        .select();
      savedLeads = upserted ?? [];
    }

    return NextResponse.json({ results: savedLeads, meta: { count: savedLeads.length } });
  } catch (err) {
    if (err instanceof YouTubeQuotaExceededError) {
      return NextResponse.json({ error: "YouTube search quota has been reached. Please try again later." }, { status: 503 });
    }
    if (err instanceof YouTubeApiError) {
      return NextResponse.json({ error: "YouTube search is not available right now. Please try again later." }, { status: 502 });
    }
    console.error("search error", err);
    return NextResponse.json({ error: "Something went wrong while searching. Please try again." }, { status: 500 });
  }
}
