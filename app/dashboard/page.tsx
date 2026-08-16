import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadCard } from "@/components/leads/lead-card";
import { ExportButton } from "./export-button";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user!.id).single();
  const { data: leads } = await supabase.from("leads").select("*").eq("user_id", user!.id);

  const total = leads?.length ?? 0;
  const saved = leads?.filter((l) => l.status !== "new" && l.status !== "rejected").length ?? 0;
  const hot = leads?.filter((l) => (l.lead_score ?? 0) >= 90).length ?? 0;
  const clients = leads?.filter((l) => l.status === "client").length ?? 0;

  const topOpportunities = (leads ?? [])
    .filter((l) => l.lead_score !== null)
    .sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0))
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">
          {greeting}{profile?.name ? `, ${profile.name}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Find your next thumbnail client.</p>
      </div>

      <Link href="/dashboard/search">
        <Button variant="outline" className="w-full justify-start sm:w-auto sm:min-w-80">
          <Search className="size-4" /> Search teachers...
        </Button>
      </Link>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Leads", value: total },
          { label: "Saved Leads", value: saved },
          { label: "Hot Leads", value: hot },
          { label: "Clients", value: clients },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">🔥 Top Opportunities</h2>
        {total > 0 && <ExportButton />}
      </div>

      {topOpportunities.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No leads yet. <Link href="/dashboard/search" className="text-primary hover:underline">Run a search</Link> to get started.
          </CardContent>
        </Card>
      ) : (
        <>
          <LeadsTable leads={topOpportunities} />
          <div className="flex flex-col gap-3 md:hidden">
            {topOpportunities.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
