import type { ProspectivityZone } from "@/services/types";
import { Panel } from "@/components/app/PageHeader";
import { BrainCircuit, Compass, AlertCircle, Sparkles } from "lucide-react";

export function ZoneDetailPanel({
  zone,
  onClose,
}: {
  zone?: ProspectivityZone | undefined;
  onClose?: (() => void) | undefined;
}) {
  if (!zone) return null;

  const geology = zone.geology_pct ?? 38;
  const satellite = zone.satellite_pct ?? 24;
  const terrain = zone.terrain_pct ?? 15;
  const borehole = zone.borehole_pct ?? 10;
  const score = Number(zone.prospectivity_score).toFixed(0);
  const confidence = zone.confidence_score ?? 82;

  return (
    <Panel
      title={`Manganese Prospectivity — ${zone.label}`}
      right={
        onClose ? (
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/30 p-3">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Modelled Prospectivity</p>
            <p className="font-display text-2xl font-bold text-primary">{score}%</p>
            <p className="text-[10px] text-muted-foreground">Category: {zone.category.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">Model Confidence</p>
            <p className="font-display text-2xl font-bold text-accent">{confidence}%</p>
            <p className="text-[10px] text-muted-foreground">Version: {zone.model_version}</p>
          </div>
        </div>

        {/* Contributing Factors */}
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            <Compass className="h-3.5 w-3.5 text-primary" /> Contributing Factors
          </p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Geology</span>
                <span className="font-semibold text-emerald-400">+{geology}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${geology * 2}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Satellite Indicators</span>
                <span className="font-semibold text-sky-400">+{satellite}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${satellite * 2}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Terrain &amp; Geomorphology</span>
                <span className="font-semibold text-amber-400">+{terrain}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${terrain * 2}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Borehole Evidence</span>
                <span className="font-semibold text-purple-400">+{borehole}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${borehole * 2}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Interpretation */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
            <BrainCircuit className="h-3.5 w-3.5" /> AI Interpretation
          </p>
          <p className="text-xs text-foreground/90 italic leading-relaxed">
            &ldquo;{zone.ai_interpretation || "Favourable geological and remote-sensing characteristics."}&rdquo;
          </p>
        </div>

        {/* Recommendation */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-accent mb-1">
            <Sparkles className="h-3.5 w-3.5" /> Recommendation
          </p>
          <p className="text-xs font-medium text-foreground">
            {zone.recommendation || "Prioritize this area for further geological investigation."}
          </p>
        </div>

        {/* Mandatory Terminology Disclaimer */}
        <div className="flex items-start gap-2 text-[10px] text-muted-foreground/80 border-t border-border pt-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
          <p>
            <strong>Note:</strong> Values express <em>Modelled Prospectivity / Favourability</em>. 
            Does not represent confirmed manganese deposits, reserves, or guaranteed mineralization.
          </p>
        </div>
      </div>
    </Panel>
  );
}
