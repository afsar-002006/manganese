import { AlertTriangle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-warning",
        className,
      )}
      title="All figures shown are synthetic demonstration data, not actual company figures."
    >
      <AlertTriangle className="h-3 w-3" />
      Demo data
    </span>
  );
}

export function ApproximateLocationBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground",
        className,
      )}
      title="Coordinates are approximate and indicative only — not survey grade."
    >
      <MapPin className="h-3 w-3" />
      Approximate location
    </span>
  );
}

export function DemoDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      <span className="font-semibold text-warning">DEMO DATA.</span> All mines, zones, boreholes and
      production figures in this environment are synthetic records generated for demonstration. They
      are not actual MOIL figures. Map geometry and borehole coordinates are approximate. Model
      outputs express <span className="font-medium text-foreground">prospectivity</span> — modelled
      favourability for further exploration — and are not a detection of manganese or a statement of
      reserves.
    </p>
  );
}
