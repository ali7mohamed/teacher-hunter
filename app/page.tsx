import Link from "next/link";
import { Search, Target, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Search className="size-6" />
      </div>

      <div className="flex max-w-lg flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Teacher Hunter</h1>
        <p className="text-sm text-muted-foreground">
          Search YouTube for teachers and educational creators, find their public business
          contacts, and rank them by how strong an opportunity they are for thumbnail design work.
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/signup">Get started</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>

      <div className="mt-4 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-4 text-left">
          <Target className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            Real YouTube data only — no fabricated subscriber counts or contacts.
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-4 text-left">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            Only publicly listed business contact info — nothing scraped or guessed.
          </p>
        </div>
      </div>
    </div>
  );
}
