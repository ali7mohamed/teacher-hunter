import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import { leadPriorityLabel } from "@/types/lead";
import type { LeadStatus } from "@/types/lead";

const VALID_STATUSES: LeadStatus[] = ["new", "contacted", "replied", "negotiating", "client", "rejected"];

const COLUMNS = [
  { header: "Teacher", key: "name", width: 28 },
  { header: "Subject", key: "subject", width: 18 },
  { header: "Education Level", key: "education_level", width: 18 },
  { header: "YouTube URL", key: "youtube_url", width: 34 },
  { header: "Subscribers", key: "subscriber_count", width: 14 },
  { header: "Last Activity", key: "last_video_at", width: 16 },
  { header: "WhatsApp", key: "whatsapp", width: 16 },
  { header: "Phone", key: "phone", width: 16 },
  { header: "Email", key: "email", width: 26 },
  { header: "Website", key: "website", width: 26 },
  { header: "Thumbnail Opportunity", key: "thumbnail_opportunity_score", width: 14 },
  { header: "Lead Score", key: "lead_score", width: 18 },
  { header: "Status", key: "status", width: 14 },
  { header: "Notes", key: "notes", width: 30 },
];

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // respect the same filters used on the Leads page
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = supabase.from("leads").select("*").eq("user_id", user.id);
  if (status && VALID_STATUSES.includes(status as LeadStatus)) query = query.eq("status", status);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data: leads, error } = await query.order("lead_score", { ascending: false, nullsFirst: false });
  if (error) return NextResponse.json({ error: "Could not export leads." }, { status: 500 });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Teacher Hunter";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Leads", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = COLUMNS;

  // header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
  sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + COLUMNS.length)}1` };

  (leads ?? []).forEach((lead) => {
    sheet.addRow({
      name: lead.name ?? "Not available",
      subject: lead.subject ?? "Not available",
      education_level: lead.education_level ?? "Not available",
      youtube_url: lead.youtube_url ?? "Not available",
      subscriber_count: lead.subscriber_count ?? "Not available",
      last_video_at: lead.last_video_at ?? "Not available",
      whatsapp: lead.business_whatsapp ?? "Not available",
      phone: lead.business_phone ?? "Not available",
      email: lead.business_email ?? "Not available",
      website: lead.website_url ?? "Not available",
      thumbnail_opportunity_score: lead.thumbnail_opportunity_score ?? "Not available",
      lead_score:
        lead.lead_score !== null ? `${lead.lead_score} (${leadPriorityLabel(lead.lead_score)})` : "Not available",
      status: lead.status,
      notes: lead.notes ?? "",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="teacher-hunter-leads-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}