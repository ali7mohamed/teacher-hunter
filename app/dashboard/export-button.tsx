"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportButton() {
  return (
    <a href="/api/export">
      <Button variant="outline" size="sm">
        <Download className="size-3.5" /> Export CSV
      </Button>
    </a>
  );
}
