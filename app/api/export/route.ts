import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/utils/csv";
import { leadPriorityLabel } from "@/types/lead";

const COLUMNS = [
  "Teacher", "Subject", "Education Level", "YouTube URL", "Subscribers", "Last Activity",
  "WhatsApp", "Phone", "Email", "Website", "Thumbnail Opportunity", "Lead Score", "Status", "Notes",
];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: leads, error } = await supabase.from("leads").select("*").eq("user_id", user.id).order("lead_score", { ascending: false });
  if (error) return NextResponse.json({ error: "Could not export leads." }, { status: 500 });

  const rows = (leads ?? []).map((lead) => ({
    "Teacher": lead.name ?? "Not available",
    "Subject": lead.subject ?? "Not available",
    "Education Level": lead.education_level ?? "Not available",
    "YouTube URL": lead.youtube_url ?? "Not available",
    "Subscribers": lead.subscriber_count ?? "Not available",
    "Last Activity": lead.last_video_at ?? "Not available",
    "WhatsApp": lead.business_whatsapp ?? "Not available",
    "Phone": lead.business_phone ?? "Not available",
    "Email": lead.business_email ?? "Not available",
    "Website": lead.website_url ?? "Not available",
    "Thumbnail Opportunity": lead.thumbnail_opportunity_score ?? "Not available",
    "Lead Score": lead.lead_score !== null ? `${lead.lead_score} (${leadPriorityLabel(lead.lead_score)})` : "Not available",
    "Status": lead.status,
    "Notes": lead.notes ?? "",
  }));

  const csv = toCsv(rows, COLUMNS);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="teacher-hunter-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
