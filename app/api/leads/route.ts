import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leadsListQuerySchema } from "@/lib/validation/search";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parsed = leadsListQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }
  const { page, limit, status, minScore, search } = parsed.data;

  let query = supabase.from("leads").select("*", { count: "exact" }).eq("user_id", user.id);
  if (status) query = query.eq("status", status);
  if (minScore !== undefined) query = query.gte("lead_score", minScore);
  if (search) query = query.ilike("name", `%${search}%`);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.order("lead_score", { ascending: false, nullsFirst: false }).range(from, from + limit - 1);

  if (error) {
    console.error("leads list error", error);
    return NextResponse.json({ error: "Could not load leads." }, { status: 500 });
  }

  return NextResponse.json({ results: data, meta: { count: count ?? 0, page, limit } });
}
