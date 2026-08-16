import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Lead } from "@/types/lead";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PriorityBadge } from "./priority-badge";
import { ContactBadges } from "./contact-badges";
import { activityLabel } from "@/lib/scoring";

export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-border md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>YouTube</TableHead>
            <TableHead>Subscribers</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Thumbnail Opp.</TableHead>
            <TableHead>Lead Score</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name ?? "Not available"}</TableCell>
              <TableCell>
                {lead.youtube_url ? (
                  <a href={lead.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    Channel <ExternalLink className="size-3" />
                  </a>
                ) : (
                  "Not available"
                )}
              </TableCell>
              <TableCell>{lead.subscriber_count !== null ? lead.subscriber_count.toLocaleString() : "Not available"}</TableCell>
              <TableCell>{activityLabel(lead.last_video_at)}</TableCell>
              <TableCell>
                <ContactBadges lead={lead} />
              </TableCell>
              <TableCell>{lead.thumbnail_opportunity_score !== null ? `${lead.thumbnail_opportunity_score}/100` : "Not analyzed"}</TableCell>
              <TableCell>
                <PriorityBadge score={lead.lead_score} />
              </TableCell>
              <TableCell>
                <Link href={`/dashboard/leads/${lead.id}`} className="text-sm text-primary hover:underline">
                  Open
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
