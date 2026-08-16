"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MessageCircle, Copy, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Lead, LeadStatus } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/leads/priority-badge";
import { activityLabel } from "@/lib/scoring";

const STATUSES: LeadStatus[] = ["new", "contacted", "replied", "negotiating", "client", "rejected"];

function na(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === "" ? "Not available" : String(value);
}

async function copy(value: string) {
  await navigator.clipboard.writeText(value);
  toast.success("Copied to clipboard");
}

export function LeadDetailClient({ initialLead }: { initialLead: Lead }) {
  const router = useRouter();
  const [lead, setLead] = useState(initialLead);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [analyzing, startAnalyzing] = useTransition();
  const [savingNotes, startSavingNotes] = useTransition();

  async function updateStatus(status: string) {
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Could not update status.");
      return;
    }
    const data = await res.json();
    setLead(data.lead);
    toast.success("Status updated");
    router.refresh();
  }

  function saveNotes() {
    startSavingNotes(async () => {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        toast.error("Could not save note.");
        return;
      }
      toast.success("Note saved");
    });
  }

  function runThumbnailAnalysis() {
    startAnalyzing(async () => {
      const res = await fetch(`/api/leads/${lead.id}/analyze`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Thumbnail analysis is unavailable right now.");
        return;
      }
      setLead(data.lead);
      toast.success("Thumbnail opportunity analyzed");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-semibold">{na(lead.name)}</h1>
          <p className="text-sm text-muted-foreground">
            {na(lead.subject)} · {na(lead.education_level)} · {na(lead.country)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge score={lead.lead_score} />
          <span className="text-sm text-muted-foreground">{lead.lead_score ?? "—"}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>YouTube</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Row label="Channel" value={lead.youtube_title} />
            <Row label="Subscribers" value={lead.subscriber_count?.toLocaleString() ?? null} />
            <Row label="Video count" value={lead.video_count} />
            <Row label="Recent activity" value={activityLabel(lead.last_video_at)} />
            <Row label="Avg. recent views" value={lead.average_recent_views?.toLocaleString() ?? null} />
            <Row label="Teacher relevance" value={lead.teacher_relevance_score !== null ? `${lead.teacher_relevance_score}%` : null} />
            {lead.youtube_url && (
              <a href={lead.youtube_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Open YouTube <ExternalLink className="size-3.5" />
                </Button>
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <ContactRow
              label="WhatsApp"
              value={lead.business_whatsapp}
              action={
                lead.business_whatsapp && (
                  <a href={`https://wa.me/${lead.business_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="size-3.5" /> Open WhatsApp
                    </Button>
                  </a>
                )
              }
            />
            <ContactRow
              label="Phone"
              value={lead.business_phone}
              action={
                lead.business_phone && (
                  <Button variant="outline" size="sm" onClick={() => copy(lead.business_phone!)}>
                    <Copy className="size-3.5" /> Copy
                  </Button>
                )
              }
            />
            <ContactRow
              label="Email"
              value={lead.business_email}
              action={
                lead.business_email && (
                  <Button variant="outline" size="sm" onClick={() => copy(lead.business_email!)}>
                    <Copy className="size-3.5" /> Copy
                  </Button>
                )
              }
            />
            <ContactRow
              label="Website"
              value={lead.website_url}
              action={
                lead.website_url && (
                  <a href={lead.website_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      Open Website <ExternalLink className="size-3.5" />
                    </Button>
                  </a>
                )
              }
            />
            {lead.contact_source_url && (
              <p className="text-xs text-muted-foreground">
                Source: {lead.contact_source_url}
                {lead.contact_confidence && (
                  <>
                    {" "}
                    · Confidence: <Badge variant="outline" className="ml-1">{lead.contact_confidence}</Badge>
                  </>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thumbnail Opportunity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {lead.thumbnail_opportunity_score !== null ? (
              <p className="text-2xl font-semibold text-primary">{lead.thumbnail_opportunity_score}/100</p>
            ) : (
              <p className="text-muted-foreground">Not analyzed yet</p>
            )}
            <p className="text-xs text-muted-foreground">Estimated opportunity — not a real CTR measurement.</p>
            <Button size="sm" onClick={runThumbnailAnalysis} disabled={analyzing}>
              {analyzing ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              {lead.thumbnail_opportunity_score !== null ? "Re-analyze" : "Analyze Thumbnails"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          <ScoreCell label="Audience" value={lead.score_breakdown && typeof lead.score_breakdown === "object" ? (lead.score_breakdown as Record<string, number>).audience : null} max={30} />
          <ScoreCell label="Activity" value={lead.activity_score} max={20} />
          <ScoreCell label="Relevance" value={lead.score_breakdown && typeof lead.score_breakdown === "object" ? (lead.score_breakdown as Record<string, number>).teacherRelevance : null} max={15} />
          <ScoreCell label="Contact" value={lead.contact_score} max={20} />
          <ScoreCell label="Thumbnail" value={lead.score_breakdown && typeof lead.score_breakdown === "object" ? (lead.score_breakdown as Record<string, number>).thumbnailOpportunity : null} max={15} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mini CRM</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <Select value={lead.status} onValueChange={updateStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-input bg-transparent p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Contacted on August 8. Interested in thumbnails. Asked for pricing."
            />
            <Button size="sm" onClick={saveNotes} disabled={savingNotes} className="self-start">
              {savingNotes ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Save Note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{na(value)}</span>
    </div>
  );
}

function ContactRow({ label, value, action }: { label: string; value: string | null; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium">{na(value)}</p>
      </div>
      {action}
    </div>
  );
}

function ScoreCell({ label, value, max }: { label: string; value: number | null | undefined; max: number }) {
  return (
    <div className="rounded-md border border-border p-3 text-center">
      <p className="text-lg font-semibold">
        {value ?? 0}
        <span className="text-xs text-muted-foreground">/{max}</span>
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
