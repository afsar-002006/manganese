import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import { Layers } from "lucide-react";
import { useMine } from "@/context/MineContext";
import { miningService } from "@/services/mining-service";
import { EmptyState, PageHeader, Panel } from "@/components/app/PageHeader";
import { ApproximateLocationBadge, DemoDisclaimer } from "@/components/app/DemoBadge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { MapLayers } from "@/components/map/ProspectivityMap";
import { ZoneDetailPanel } from "@/components/map/ZoneDetailPanel";
import { BoreholeDetailModal } from "@/components/map/BoreholeDetailModal";
import { DataSourcesPanel } from "@/components/app/DataSourcesPanel";
import { DrillPlanner } from "@/components/app/DrillPlanner";
import { cn } from "@/lib/utils";

const ProspectivityMap = lazy(() => import("@/components/map/ProspectivityMap"));

export const Route = createFileRoute("/_authenticated/prospectivity")({
  head: () => ({
    meta: [
      { title: "Prospectivity Map — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Interactive Web GIS view of modelled manganese prospectivity zones, geology, and borehole locations for the selected mine lease.",
      },
      { property: "og:title", content: "Prospectivity Map — Manganese Intelligence" },
      {
        property: "og:description",
        content: "Toggleable prospectivity, geology, borehole and imagery layers over the selected mine lease.",
      },
    ],
  }),
  component: ProspectivityPage,
});

function MapSkeleton() {
  return (
    <div className="flex h-[560px] items-center justify-center rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
      Loading map…
    </div>
  );
}

function ProspectivityPage() {
  const {
    mine,
    mineId,
    selectedZoneId,
    setSelectedZoneId,
    selectedBoreholeId,
    setSelectedBoreholeId,
  } = useMine();

  const [layers, setLayers] = useState<MapLayers>({
    prospectivity: true,
    geology: true,
    boreholes: true,
    faults: true,
    equipment: false,
    production: false,
    weather: false,
    blasting: false,
    zoneLabels: true,
    satellite: true,
    mode: "thermal",
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

  const zoneList = zones.data ?? [];
  const boreholeList = boreholes.data ?? [];

  const activeZone = zoneList.find((z) => z.id === selectedZoneId);
  const activeBorehole = boreholeList.find((b) => b.id === selectedBoreholeId);

  type LayerKey = keyof MapLayers;
  const toggle = (key: LayerKey) => setLayers((l) => ({ ...l, [key]: !l[key] }));

  const LAYER_OPTIONS: { key: LayerKey; label: string }[] = [
    { key: "prospectivity", label: "Prospectivity Zones" },
    { key: "geology", label: "Geology Formations" },
    { key: "boreholes", label: "Boreholes" },
    { key: "faults", label: "Fault Structures" },
    { key: "equipment", label: "Equipment Assets" },
    { key: "production", label: "Production Pits" },
    { key: "weather", label: "Weather Radar" },
    { key: "blasting", label: "Blast Hazard Zones" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manganese Prospectivity & Web GIS Map"
        subtitle="Modelled favourability for further exploration with spatial target estimation."
        actions={<ApproximateLocationBadge />}
      />

      {/* Drill Planner Component */}
      <DrillPlanner />

      <div className="grid gap-5 xl:grid-cols-4">
        <Panel
          className="xl:col-span-3"
          title={mine ? `${mine.name} Lease Area` : "Map"}
          right={
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { key: "thermal", label: "Thermal sensing" },
                  { key: "zones", label: "Zone-wise" },
                ] as const
              ).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setLayers((l) => ({ ...l, mode: m.key }))}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    layers.mode === m.key
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-border" />
              {(
                [
                  { sat: true, label: "Satellite" },
                  { sat: false, label: "Terrain" },
                ] as const
              ).map((v) => (
                <button
                  key={v.label}
                  onClick={() => setLayers((l) => ({ ...l, satellite: v.sat }))}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    layers.satellite === v.sat
                      ? "bg-accent text-accent-foreground"
                      : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          }
        >
          {!mine ? (
            <MapSkeleton />
          ) : (
            <div className="h-[580px] overflow-hidden rounded-xl">
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
            </div>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel title="Interactive Map Layers">
            <div className="space-y-2.5">
              {LAYER_OPTIONS.map((opt) => (
                <div key={opt.key} className="flex items-center justify-between gap-3">
                  <Label htmlFor={opt.key} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    {opt.label}
                  </Label>
                  <Switch
                    id={opt.key}
                    checked={Boolean(layers[opt.key])}
                    onCheckedChange={() => toggle(opt.key)}
                  />
                </div>
              ))}
            </div>
          </Panel>

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

          <Panel title="Zone Ranking &amp; Selection">
            {zoneList.length === 0 ? (
              <EmptyState message="No zones modelled for this mine." />
            ) : (
              <ul className="space-y-2">
                {zoneList.map((z) => {
                  const active = selectedZoneId === z.id;
                  return (
                    <li key={z.id}>
                      <button
                        onClick={() => setSelectedZoneId(active ? undefined : z.id)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors text-left",
                          active
                            ? "border-primary bg-primary/20 font-semibold text-primary"
                            : "border-border bg-muted/30 hover:border-primary/40",
                        )}
                      >
                        <span>{z.label}</span>
                        <span className="font-semibold tabular-nums">
                          {Number(z.prospectivity_score).toFixed(0)}%
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <DataSourcesPanel />

      <Panel>
        <DemoDisclaimer />
      </Panel>
    </div>
  );
}

