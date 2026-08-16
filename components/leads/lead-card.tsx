import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { Lead } from "@/types/lead";
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "./priority-badge";
import { ContactBadges } from "./contact-badges";

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Link href={`/dashboard/leads/${lead.id}`} className="block md:hidden">
      <Card className="transition-colors hover:border-primary/50">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4 shrink-0 text-primary" />
              <span className="font-medium">{lead.name ?? "Not available"}</span>
            </div>
            <PriorityBadge score={lead.lead_score} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{lead.subscriber_count !== null ? `${lead.subscriber_count.toLocaleString()} subscribers` : "Subscribers: Not available"}</span>
            {lead.thumbnail_opportunity_score !== null && <span>Thumbnail Opportunity {lead.thumbnail_opportunity_score}/100</span>}
          </div>

          <ContactBadges lead={lead} />
        </CardContent>
      </Card>
    </Link>
  );
}
