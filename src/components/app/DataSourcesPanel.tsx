import { Panel } from "@/components/app/PageHeader";
import { Database, ShieldAlert, Satellite, Mountain, CloudRain, Factory, Layers } from "lucide-react";

export function DataSourcesPanel() {
  const SOURCES = [
    { title: "Satellite Remote Sensing", icon: Satellite, desc: "Sentinel-1 SAR, Sentinel-2 MSI, Landsat 8/9" },
    { title: "Geological Datasets", icon: Layers, desc: "Public geological survey maps & stratigraphy" },
    { title: "Borehole Data", icon: Mountain, desc: "Synthetic demonstration drillhole records" },
    { title: "Weather Observations", icon: CloudRain, desc: "Public & historical rainfall observation data" },
    { title: "Production Records", icon: Factory, desc: "Synthetic demonstration operational figures" },
  ];

  return (
    <Panel
      title="Data Sources &amp; Provenance"
      right={
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Database className="h-3.5 w-3.5" /> Provenance Registry
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          {SOURCES.map((s, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-muted/20 p-3 space-y-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary mb-2">
                <s.icon className="h-4 w-4" />
              </span>
              <p className="text-xs font-semibold text-foreground">{s.title}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Mandatory Prominent Disclaimer Banner */}
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-bold uppercase tracking-wider text-amber-300">
                DEMONSTRATION DATA — NOT CONFIDENTIAL MOIL DATA
              </p>
              <p className="text-[11px] text-amber-200/80">
                All coordinates, grade assays, production targets, and borehole logs are synthetic demonstration datasets generated for prototype validation.
              </p>
            </div>
          </div>
          <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-amber-300">
            SIH 2026 PROTOTYPE
          </span>
        </div>
      </div>
    </Panel>
  );
}
