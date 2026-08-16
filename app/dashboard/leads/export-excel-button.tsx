import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportExcelButton({ status, search }: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const query = params.toString();

  return (
    <Link href={`/api/export/excel${query ? `?${query}` : ""}`}>
      <Button variant="outline" size="sm">
        <FileSpreadsheet className="size-3.5" /> Export Excel
      </Button>
    </Link>
  );
}