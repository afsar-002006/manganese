import { Panel } from "@/components/app/PageHeader";
import { Compass, Factory, Truck, SlidersHorizontal, Sparkles, CheckCircle } from "lucide-react";
import type { ProspectivityZone } from "@/services/types";

export function DecisionCenter({
  zone,
  downtimeVal = 18,
  rainfallVal = 6,
}: {
  zone?: ProspectivityZone | undefined;
  downtimeVal?: number | undefined;
  rainfallVal?: number | undefined;
}) {
  const zoneLabel = zone?.label || "Zone A (North Block)";
  const score = zone?.prospectivity_score ?? 87;

  // Dynamic recommendations based on active zone and scenario parameters
  const explorationRec = score >= 75
    ? `Prioritize ${zoneLabel} for immediate infill diamond drilling.`
    : score >= 50
    ? `Conduct ground geophysical survey across ${zoneLabel} before committing rig.`
    : `De-prioritize ${zoneLabel}; reallocate exploration budget to North Block.`;

  const productionRec = downtimeVal > 20
    ? "Expected production shortfall: 7.8% due to high equipment downtime."
    : rainfallVal > 15
    ? "Expected production shortfall: 6.2% due to heavy monsoon rainfall."
    : "Expected production shortfall: 4.2% under baseline operations.";

  const operationsRec = downtimeVal > 15
    ? "Equipment EX-14 requires urgent hydraulic maintenance to avoid unscheduled halt."
    : "Deploy Dumper DP-08 to high-grade pit face to optimize cycle time.";

  const planningRec = rainfallVal > 10
    ? "Scenario 'Monsoon Contingency B' provides highest expected production (+5.7%)."
    : "Scenario 'Max Availability' provides peak projected output of 87,100 tonnes.";

  const DECISIONS = [
    {
      category: "EXPLORATION",
      title: "Exploration Action",
      icon: Compass,
      recommendation: explorationRec,
      badge: "High Impact",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      category: "PRODUCTION",
      title: "Production Strategy",
      icon: Factory,
      recommendation: productionRec,
      badge: "Shortfall Risk",
      badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
    {
      category: "OPERATIONS",
      title: "Operational Intervention",
      icon: Truck,
      recommendation: operationsRec,
      badge: "Asset Care",
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    {
      category: "PLANNING",
      title: "Planning Optimization",
      icon: SlidersHorizontal,
      recommendation: planningRec,
      badge: "Scenario Choice",
      badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    },
  ];

  return (
    <Panel
      title="Decision Center"
      right={
        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
          <Sparkles className="h-4 w-4" /> Mining Intelligence DSS
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
          <span>Targeting Active Lease: <strong className="text-foreground">{zoneLabel}</strong></span>
          <span className="text-[10px] uppercase font-mono">Real-time Optimization</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {DECISIONS.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-border bg-muted/25 p-3.5 space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <item.icon className="h-3.5 w-3.5" />
                  </span>
                  {item.category}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-foreground/90">
                &ldquo;{item.recommendation}&rdquo;
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
                <CheckCircle className="h-3 w-3 text-emerald-400" /> Grounded on current zone &amp; scenario state
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
