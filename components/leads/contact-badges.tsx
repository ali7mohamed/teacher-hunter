import { MessageCircle, Mail, Phone, Globe } from "lucide-react";
import type { Lead } from "@/types/lead";
import { cn } from "@/lib/utils/cn";

export function ContactBadges({ lead }: { lead: Pick<Lead, "business_whatsapp" | "business_phone" | "business_email" | "website_url"> }) {
  const items = [
    { available: !!lead.business_whatsapp, icon: MessageCircle, label: "WhatsApp" },
    { available: !!lead.business_phone, icon: Phone, label: "Phone" },
    { available: !!lead.business_email, icon: Mail, label: "Email" },
    { available: !!lead.website_url, icon: Globe, label: "Website" },
  ];

  const any = items.some((i) => i.available);
  if (!any) return <span className="text-xs text-muted-foreground">Not available</span>;

  return (
    <div className="flex items-center gap-1.5">
      {items
        .filter((i) => i.available)
        .map((i) => (
          <span key={i.label} className={cn("flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs text-primary")} title={i.label}>
            <i.icon className="size-3" />
          </span>
        ))}
    </div>
  );
}
