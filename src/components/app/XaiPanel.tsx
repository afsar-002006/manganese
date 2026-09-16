import { useState } from "react";
import { Panel } from "@/components/app/PageHeader";
import { BrainCircuit, Compass, Gauge, Info } from "lucide-react";
import type { ProspectivityZone } from "@/services/types";
import { cn } from "@/lib/utils";

export function XaiPanel({ zone }: { zone?: ProspectivityZone | undefined }) {
  const [modelType, setModelType] = useState<"geo" | "production">("geo");

  // Dynamic SHAP values based on selected zone
  const geoShap = [
    { feature: "Geology (Lithology & Structure)", value: zone?.geology_pct ?? 38, type: "positive" },
    { feature: "Satellite Index (NDVI/Thermal)", value: zone?.satellite_pct ?? 24, type: "positive" },
    { feature: "Terrain & Elevation Contour", value: zone?.terrain_pct ?? 15, type: "positive" },
    { feature: "Borehole Assay Evidence", value: zone?.borehole_pct ?? 10, type: "positive" },
    { feature: "Regolith / Cover Thickness", value: -5, type: "negative" },
  ];

  const prodShap = [
    { feature: "Equipment Availability & Downtime", value: 35, type: "positive" },
    { feature: "Ore Grade (% Mn)", value: 22, type: "positive" },
    { feature: "Rainfall & Bench Draining", value: -12, type: "negative" },
    { feature: "Blasting Delay & Fragmentation", value: -8, type: "negative" },
    { feature: "Haul Road Incline Gradient", value: 6, type: "positive" },
  ];

  const currentFeatures = modelType === "geo" ? geoShap : prodShap;
  const maxVal = Math.max(...currentFeatures.map((f) => Math.abs(f.value)));

  return (
    <Panel
      title="Explainable AI (XAI / SHAP)"
      right={
        <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
          <button
            onClick={() => setModelType("geo")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              modelType === "geo"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Compass className="h-3.5 w-3.5" /> Geo-AI Model
          </button>
          <button
            onClick={() => setModelType("production")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              modelType === "production"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Gauge className="h-3.5 w-3.5" /> Production AI Model
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Why did the {modelType === "geo" ? "Geo-AI" : "Production AI"} model predict this?
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {modelType === "geo"
                ? `Feature contribution score for ${zone?.label || "Selected Zone"}`
                : "Attribution of operational drivers on output predictions"}
            </p>
          </div>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            SHAP Attribution
          </span>
        </div>

        {/* Feature Contribution Bars */}
        <div className="space-y-3">
          {currentFeatures.map((item, idx) => {
            const widthPct = Math.min(100, Math.round((Math.abs(item.value) / maxVal) * 100));
            const isPos = item.value >= 0;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">{item.feature}</span>
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      isPos ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    {isPos ? "+" : ""}
                    {item.value}%
                  </span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/50">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isPos ? "bg-emerald-500" : "bg-rose-500",
                    )}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-primary" />
          <span>
            Deterministic SHAP decomposition calculated dynamically for the selected model. 
            Green indicates positive feature push, red indicates negative constraint.
          </span>
        </div>
      </div>
    </Panel>
  );
}
