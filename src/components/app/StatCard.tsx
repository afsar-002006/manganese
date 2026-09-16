import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string | undefined;
  tone?: "default" | "danger" | "success" | "warning" | "accent" | undefined;
  progress?: number | undefined;
}

const tones: Record<string, { ring: string; icon: string; value: string }> = {
  default: { ring: "border-border", icon: "bg-primary/15 text-primary", value: "text-foreground" },
  danger: {
    ring: "border-destructive/40 bg-destructive/5",
    icon: "bg-destructive/15 text-destructive",
    value: "text-destructive",
  },
  success: { ring: "border-border", icon: "bg-success/15 text-success", value: "text-success" },
  warning: { ring: "border-border", icon: "bg-warning/15 text-warning", value: "text-warning" },
  accent: { ring: "border-border", icon: "bg-accent/15 text-accent", value: "text-accent" },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
  progress,
}: StatCardProps) {
  const t = tones[tone] ?? tones["default"]!;
  return (
    <div className={cn("panel flex flex-col gap-3 p-4", t.ring)}>
      <div className="flex items-start gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", t.icon)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className={cn("mt-1 font-display text-2xl font-bold tabular-nums", t.value)}>{value}</p>
        </div>
      </div>
      {progress != null && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
