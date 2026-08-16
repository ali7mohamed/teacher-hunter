import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadCard } from "@/components/leads/lead-card";
import { Card, CardContent } from "@/components/ui/card";

/** §33: "Saved" = every lead not in its default "new" state, i.e. leads the user has acted on. */
export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user!.id)
    .neq("status", "rejected")
    .order("updated_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Saved Leads</h1>
        <p className="text-sm text-muted-foreground">Leads you&apos;re actively tracking or have reached out to.</p>
      </div>

      {!leads || leads.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">No saved leads yet.</CardContent>
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
