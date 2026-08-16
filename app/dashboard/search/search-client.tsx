"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadCard } from "@/components/leads/lead-card";
import type { Lead } from "@/types/lead";

const LOADING_STEPS = ["Searching YouTube...", "Analyzing channels...", "Checking public contact information...", "Calculating lead scores..."];

export function SearchClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [minSubscribers, setMinSubscribers] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [results, setResults] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setStepIndex(0);
    const interval = setInterval(() => setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1)), 1800);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          filters: minSubscribers ? { minSubscribers: Number(minSubscribers) } : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResults(data.results as Lead[]);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Find Teachers</h1>
        <p className="text-sm text-muted-foreground">Search YouTube for teachers and educational creators worth pitching.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مدرس عربي ثانوية عامة مصر"
            className="pl-9"
            dir="auto"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="number"
            min={0}
            value={minSubscribers}
            onChange={(e) => setMinSubscribers(e.target.value)}
            placeholder="Minimum subscribers (optional)"
            className="sm:max-w-xs"
          />
          <Button type="submit" disabled={loading || !query.trim()} className="sm:ml-auto">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <SearchIcon className="size-4" />}
            Search Teachers
          </Button>
        </div>
      </form>

      {loading && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            {LOADING_STEPS[stepIndex]}
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {results && !loading && results.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">No suitable teachers found.</p>
            Try:
            <ul className="mt-1 list-inside list-disc">
              <li>a broader subject</li>
              <li>another education level</li>
              <li>removing the subscriber filter</li>
              <li>using Arabic or English keywords</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {results && results.length > 0 && !loading && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{results.length} teachers found, ranked by lead score.</p>
          <LeadsTable leads={results} />
          <div className="flex flex-col gap-3 md:hidden">
            {results.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
