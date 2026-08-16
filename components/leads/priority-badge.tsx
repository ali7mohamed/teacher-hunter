import { Badge } from "@/components/ui/badge";
import { leadPriorityLabel } from "@/types/lead";

export function PriorityBadge({ score }: { score: number | null }) {
  const label = leadPriorityLabel(score);
  const variant = label === "Hot Lead" ? "destructive" : label === "Strong Lead" ? "default" : label === "Good Lead" ? "secondary" : "muted";
  const emoji = label === "Hot Lead" ? "🔥" : label === "Strong Lead" ? "⭐" : label === "Good Lead" ? "🟢" : "⚪";

  return (
    <Badge variant={variant}>
      {emoji} {label}
    </Badge>
  );
}
