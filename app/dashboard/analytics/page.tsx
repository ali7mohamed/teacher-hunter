import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads } = await supabase.from("leads").select("status, lead_score").eq("user_id", user!.id);

  const total = leads?.length ?? 0;
  const hot = leads?.filter((l) => (l.lead_score ?? 0) >= 90).length ?? 0;
  const saved = leads?.filter((l) => l.status !== "new" && l.status !== "rejected").length ?? 0;
  const contacted = leads?.filter((l) => l.status === "contacted" || l.status === "replied" || l.status === "negotiating" || l.status === "client").length ?? 0;
  const replies = leads?.filter((l) => l.status === "replied" || l.status === "negotiating" || l.status === "client").length ?? 0;
  const clients = leads?.filter((l) => l.status === "client").length ?? 0;
  const conversionRate = contacted > 0 ? Math.round((clients / contacted) * 100) : null;

  const stats = [
    { label: "Total Leads", value: total },
    { label: "Hot Leads", value: hot },
    { label: "Saved Leads", value: saved },
    { label: "Contacted", value: contacted },
    { label: "Replies", value: replies },
    { label: "Clients", value: clients },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Outreach performance across all your leads.</p>
      </div>

      {total === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Not enough data yet.</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {conversionRate !== null ? (
                <p className="text-2xl font-semibold text-primary">{conversionRate}%</p>
              ) : (
                <p className="text-sm text-muted-foreground">Not enough data yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
