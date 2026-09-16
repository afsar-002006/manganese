import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import {
  AlertTriangle,
  CloudRain,
  Hammer,
  MapPin,
  Truck,
  ArrowRight,
  Compass,
  BrainCircuit,
  Factory,
  ShieldCheck,
  Layers,
  Upload,
  FileBarChart,
  Mountain,
  Flame,
  Grid3x3,
  Satellite,
  Trees,
  Lightbulb,
  CheckSquare,
  Square,
  Activity,
  ShieldAlert,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMine } from "@/context/MineContext";
import { miningService } from "@/services/mining-service";
import { EmptyState, Panel } from "@/components/app/PageHeader";
import { DemoDisclaimer } from "@/components/app/DemoBadge";
import { monthLabel, pct, tonnes } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { MapLayers } from "@/components/map/ProspectivityMap";
import heroImage from "@/assets/mine-hero.jpg";

import { ZoneDetailPanel } from "@/components/map/ZoneDetailPanel";
import { BoreholeDetailModal } from "@/components/map/BoreholeDetailModal";
import { DecisionCenter } from "@/components/app/DecisionCenter";
import { XaiPanel } from "@/components/app/XaiPanel";
import { DataSourcesPanel } from "@/components/app/DataSourcesPanel";
import { SihVideoShowcase } from "@/components/app/SihVideoShowcase";
import { MiningTooltip } from "@/components/ui/MiningTooltip";
import type { ProspectivityZone, Borehole } from "@/services/types";

const ProspectivityMap = lazy(() => import("@/components/map/ProspectivityMap"));

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Mining decision support system: prospectivity, confidence, production forecasting, XAI, and Decision Center.",
      },
      { property: "og:title", content: "Dashboard — Manganese Intelligence" },
      {
        property: "og:description",
        content: "Live operations overview for the selected manganese mine.",
      },
    ],
  }),
  component: Dashboard,
});

const PILLARS = [
  { icon: Compass, label: "Explore Smarter" },
  { icon: BrainCircuit, label: "Predict Better" },
  { icon: Factory, label: "Mine Efficiently" },
  { icon: ShieldCheck, label: "Build a Stronger India" },
];

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
  progress,
  tooltipTerm,
}: {
  icon: typeof Hammer;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "danger" | "accent" | "success" | "warning";
  progress?: number;
  tooltipTerm?: string;
}) {
  const toneText = {
    default: "text-foreground",
    danger: "text-destructive",
    accent: "text-accent",
    success: "text-success",
    warning: "text-warning",
  }[tone];
  const toneBg = {
    default: "bg-primary/15 text-primary",
    danger: "bg-destructive/15 text-destructive",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
  }[tone];

  return (
    <div
      className={cn(
        "panel flex flex-col gap-3 p-4",
        tone === "danger" && "border-destructive/40 bg-destructive/5",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneBg)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs leading-snug text-muted-foreground">
            {tooltipTerm ? <MiningTooltip term={tooltipTerm}>{label}</MiningTooltip> : label}
          </p>
          <p className={cn("font-display text-2xl font-bold leading-tight", toneText)}>{value}</p>
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="flex h-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
      Loading map…
    </div>
  );
}

function Dashboard() {
  const {
    mine,
    mineId,
    mines,
    setMineId,
    selectedZoneId,
    setSelectedZoneId,
    selectedBoreholeId,
    setSelectedBoreholeId,
  } = useMine();

  const [layers, setLayers] = useState<MapLayers>({
    prospectivity: true,
    geology: true,
    boreholes: true,
    faults: false,
    equipment: false,
    production: false,
    weather: false,
    blasting: false,
    zoneLabels: true,
    satellite: true,
    mode: "thermal",
  });

  const production = useQuery({
    queryKey: ["production", mineId],
    queryFn: () => miningService.listProduction(mineId!),
    enabled: !!mineId,
  });
  const forecasts = useQuery({
    queryKey: ["forecasts", mineId],
    queryFn: () => miningService.listForecasts(mineId!),
    enabled: !!mineId,
  });
  const zones = useQuery({
    queryKey: ["zones", mineId],
    queryFn: () => miningService.listZones(mineId!),
    enabled: !!mineId,
  });
  const boreholes = useQuery({
    queryKey: ["boreholes", mineId],
    queryFn: () => miningService.listBoreholes(mineId!),
    enabled: !!mineId,
  });
  const equipment = useQuery({
    queryKey: ["equipment", mineId],
    queryFn: () => miningService.listEquipment(mineId!),
    enabled: !!mineId,
  });
  const weather = useQuery({
    queryKey: ["weather", mineId],
    queryFn: () => miningService.listWeather(mineId!),
    enabled: !!mineId,
  });
  const drivers = useQuery({
    queryKey: ["drivers", mineId],
    queryFn: () => miningService.listShortfallDrivers(mineId!),
    enabled: !!mineId,
  });
  const recos = useQuery({
    queryKey: ["recommendations", mineId],
    queryFn: () => miningService.listRecommendations(mineId!),
    enabled: !!mineId,
  });

  const zoneList = zones.data ?? [];
  const boreholeList = boreholes.data ?? [];

  // Default selection to top zone if unselected
  const activeZone = zoneList.find((z) => z.id === selectedZoneId) ?? zoneList[0];
  const activeBorehole = boreholeList.find((b) => b.id === selectedBoreholeId);

  const nextForecast = forecasts.data?.[0];
  const fPredicted = Number(nextForecast?.predicted_tonnes ?? 82400);

  const chartData = [...(forecasts.data ?? []).slice(0, 3)].map((r) => ({
    period: monthLabel(r.period),
    Target: Number(r.target_tonnes),
    Predicted: Number(r.predicted_tonnes),
  }));

  const QUICK = [
    { to: "/prospectivity", label: "Prospectivity Map", icon: MapPin },
    { to: "/insights", label: "AI Insights", icon: BrainCircuit },
    { to: "/simulator", label: "Scenario Simulator", icon: Zap },
    { to: "/boreholes", label: "Borehole Data", icon: Mountain },
  ] as const;

  const toggleLayer = (key: keyof MapLayers) => {
    setLayers((l) => ({ ...l, [key]: !l[key] }));
  };

  const LAYER_CONTROLS: Array<{ key: keyof MapLayers; label: string }> = [
    { key: "prospectivity", label: "Prospectivity" },
    { key: "geology", label: "Geology" },
    { key: "boreholes", label: "Boreholes" },
    { key: "faults", label: "Faults" },
    { key: "equipment", label: "Equipment" },
    { key: "production", label: "Production" },
    { key: "weather", label: "Weather" },
    { key: "blasting", label: "Blasting" },
  ];

  return (
    <div className="space-y-5">
      {/* Hero Header */}
      <section className="panel relative overflow-hidden">
        <img
          src={heroImage}
          alt="Manganese open-pit mine at dusk"
          width={1920}
          height={560}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              Manganese Intelligence DSS
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Integrated Decision Support System: Explore &rarr; Predict &rarr; Explain &rarr; Simulate &rarr; Optimize &rarr; Act
              {mine ? ` — ${mine.name}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {PILLARS.map((p) => (
                <span
                  key={p.label}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/75 px-3 py-1 text-xs font-medium backdrop-blur"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <p.icon className="h-3 w-3" />
                  </span>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
          <blockquote className="max-w-xs rounded-xl border border-primary/30 bg-card/80 p-3.5 text-xs italic leading-snug backdrop-blur">
            “We don&apos;t just predict. We explain the prediction and help the mine manager decide what to do next.”
          </blockquote>
        </div>
      </section>

      {/* Required KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={Compass}
          label="MODELLED PROSPECTIVITY"
          value={`${activeZone?.prospectivity_score ?? 87}%`}
          sub={`Target Zone: ${activeZone?.label || "Zone A"}`}
          tone="accent"
          tooltipTerm="Prospectivity"
        />
        <Kpi
          icon={BrainCircuit}
          label="AI CONFIDENCE"
          value={`${activeZone?.confidence_score ?? 82}%`}
          sub="Integrated GeoAI Model v2.4"
          tone="success"
          tooltipTerm="Confidence"
        />
        <Kpi
          icon={Hammer}
          label="PRODUCTION FORECAST"
          value={`${(fPredicted / 1000).toFixed(1)}K tonnes`}
          sub="Next period projected output"
          tone="default"
        />
        <Kpi
          icon={AlertTriangle}
          label="OPERATIONAL RISK"
          value="12%"
          sub="Weather &amp; Equipment Downtime Risk"
          tone="warning"
        />
      </div>

      {/* SIH Hackathon Video Presentation & Visual Representation */}
      <SihVideoShowcase />

      {/* Main Map & GIS Interaction Grid */}
      <div className="grid gap-5 xl:grid-cols-5">
        <div className="space-y-5 xl:col-span-3">
          <section className="panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="font-display text-sm font-semibold">Web GIS Mine Lease Map</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Select Mine Lease</span>
                <Select value={mineId ?? ""} onValueChange={setMineId}>
                  <SelectTrigger className="h-8 w-[170px] bg-muted/40 text-xs">
                    <SelectValue placeholder="Select mine" />
                  </SelectTrigger>
                  <SelectContent>
                    {mines.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Compact 8-Layer Control Bar */}
            <div className="border-b border-border bg-muted/20 px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Interactive Layers:
                </span>
                {LAYER_CONTROLS.map((ctrl) => {
                  const active = Boolean(layers[ctrl.key]);
                  return (
                    <label
                      key={ctrl.key}
                      className={cn(
                        "flex items-center gap-1.5 cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors select-none",
                        active ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleLayer(ctrl.key)}
                        className="sr-only"
                      />
                      {active ? (
                        <CheckSquare className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {ctrl.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Map Container */}
            <div className="relative h-[480px]">
              {!mine ? (
                <MapSkeleton />
              ) : (
                <ClientOnly fallback={<MapSkeleton />}>
                  <Suspense fallback={<MapSkeleton />}>
                    <ProspectivityMap
                      mine={mine}
                      zones={zoneList}
                      boreholes={boreholeList}
                      layers={layers}
                      selectedZoneId={activeZone?.id}
                      selectedBoreholeId={activeBorehole?.id}
                      onSelectZone={(z) => setSelectedZoneId(z.id)}
                      onSelectBorehole={(b) => setSelectedBoreholeId(b.id)}
                    />
                  </Suspense>
                </ClientOnly>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <Panel title="Quick Navigation">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK.map((q) => (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-muted/60"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <q.icon className="h-4 w-4" />
                  </span>
                  {q.label}
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right Column: Zone Inspection & Geo-AI Details */}
        <div className="space-y-5 xl:col-span-2">
          {activeZone && (
            <ZoneDetailPanel
              zone={activeZone}
              onClose={() => setSelectedZoneId(undefined)}
            />
          )}

          {activeBorehole && (
            <BoreholeDetailModal
              borehole={activeBorehole}
              onClose={() => setSelectedBoreholeId(undefined)}
            />
          )}

          {/* XAI SHAP Panel */}
          <XaiPanel zone={activeZone} />
        </div>
      </div>

      {/* Decision Center Row */}
      <DecisionCenter zone={activeZone} />

      {/* Data Sources & Provenance */}
      <DataSourcesPanel />

      <Panel>
        <DemoDisclaimer />
      </Panel>
    </div>
  );
}

