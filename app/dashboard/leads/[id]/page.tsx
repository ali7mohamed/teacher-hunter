import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadDetailClient } from "./lead-detail-client";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).eq("user_id", user!.id).single();
  if (!lead) notFound();

  return <LeadDetailClient initialLead={lead} />;
}
