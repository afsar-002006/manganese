import type { Borehole } from "@/services/types";
import { Panel } from "@/components/app/PageHeader";
import { Mountain, CheckCircle2, AlertTriangle, X } from "lucide-react";

export function BoreholeDetailModal({
  borehole,
  onClose,
}: {
  borehole: Borehole;
  onClose?: () => void;
}) {
  const lithology = borehole.lithology ?? [
    { depth_from_m: 0, depth_to_m: 20, formation: "Laterite" },
    { depth_from_m: 20, depth_to_m: 65, formation: "Shale" },
    { depth_from_m: 65, depth_to_m: 95, formation: "Mn-bearing formation" },
    { depth_from_m: 95, depth_to_m: 120, formation: "Basement" },
  ];

  const purposes = borehole.purpose_highlights ?? [
    "Subsurface evidence",
    "Geological context",
    "Model validation",
  ];

  return (
    <Panel
      title={`Borehole Profile — ${borehole.borehole_code}`}
      right={
        onClose ? (
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" /> Close
          </button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {/* Core Metadata */}
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-muted/30 p-3 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Location</p>
            <p className="font-mono text-xs font-semibold tabular-nums text-foreground mt-0.5">
              {borehole.lat.toFixed(4)}, {borehole.lng.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Depth</p>
            <p className="font-display text-lg font-bold text-primary">{borehole.depth_m} m</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mn Assay</p>
            <p className="font-display text-lg font-bold text-emerald-400">{borehole.mn_percent}%</p>
          </div>
        </div>

        {/* Geological Depth Profile */}
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            <Mountain className="h-3.5 w-3.5 text-primary" /> Geological Profile
          </p>
          <div className="space-y-1.5 rounded-lg border border-border bg-card/60 p-2.5">
            {lithology.map((layer, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-xs"
              >
                <span className="font-mono font-medium text-muted-foreground">
                  {layer.depth_from_m}–{layer.depth_to_m} m
                </span>
                <span
                  className={`font-semibold ${
                    layer.formation.toLowerCase().includes("mn")
                      ? "text-primary"
                      : layer.formation.toLowerCase().includes("laterite")
                      ? "text-amber-400"
                      : "text-foreground"
                  }`}
                >
                  {layer.formation}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Purpose */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Purpose &amp; Model Integration
          </p>
          <ul className="grid grid-cols-3 gap-2">
            {purposes.map((p, i) => (
              <li
                key={i}
                className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs text-primary"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Data Disclaimer */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>DEMO / SYNTHETIC DATA</strong> — Not confidential MOIL borehole records.
          </span>
        </div>
      </div>
    </Panel>
  );
}
