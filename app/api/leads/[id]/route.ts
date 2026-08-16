import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leadIdSchema, leadPatchSchema } from "@/lib/validation/search";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!leadIdSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid lead id." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).eq("user_id", user.id).single();
  if (error || !lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const { data: sources } = await supabase.from("lead_sources").select("*").eq("lead_id", id);
  const { data: statusHistory } = await supabase.from("lead_status_history").select("*").eq("lead_id", id).order("created_at", { ascending: false });

  return NextResponse.json({ lead, sources: sources ?? [], statusHistory: statusHistory ?? [] });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!leadIdSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid lead id." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = leadPatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  if (Object.keys(parsed.data).length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const { data, error } = await supabase.from("leads").update(parsed.data).eq("id", id).eq("user_id", user.id).select().single();
  if (error || !data) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  return NextResponse.json({ lead: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!leadIdSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid lead id." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("leads").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Could not delete lead." }, { status: 500 });

  return NextResponse.json({ success: true });
}
