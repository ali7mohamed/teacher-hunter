import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadCard } from "@/components/leads/lead-card";
import { LeadsFilters } from "./leads-filters";
import { Card, CardContent } from "@/components/ui/card";
import type { LeadStatus } from "@/types/lead";

const VALID_STATUSES: LeadStatus[] = ["new", "contacted", "replied", "negotiating", "client", "rejected"];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("leads").select("*").eq("user_id", user!.id);
  if (status && VALID_STATUSES.includes(status as LeadStatus)) query = query.eq("status", status);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data: leads } = await query.order("lead_score", { ascending: false, nullsFirst: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">Every teacher you&apos;ve found, ranked by lead score.</p>
      </div>

      <LeadsFilters status={status ?? ""} search={search ?? ""} />

      {!leads || leads.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No leads yet. Run a search to start finding teachers.
          </CardContent>
        </Card>
      ) : (
        <>
          <LeadsTable leads={leads} />
          <div className="flex flex-col gap-3 md:hidden">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
