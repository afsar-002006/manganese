import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useMine } from "@/context/MineContext";
import { miningService } from "@/services/mining-service";
import { EmptyState, PageHeader, Panel } from "@/components/app/PageHeader";
import { ApproximateLocationBadge, DemoDisclaimer } from "@/components/app/DemoBadge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BoreholeDetailModal } from "@/components/map/BoreholeDetailModal";
import { DataSourcesPanel } from "@/components/app/DataSourcesPanel";
import { OrebodyVisualizer3D } from "@/components/3d/OrebodyVisualizer3D";
import { CoreSpectroscopyAnalyzer } from "@/components/app/CoreSpectroscopyAnalyzer";
import type { Borehole } from "@/services/types";

export const Route = createFileRoute("/_authenticated/boreholes")({
  head: () => ({
    meta: [
      { title: "Borehole Data — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Searchable borehole register with depth and manganese assay values for the selected mine.",
      },
      { property: "og:title", content: "Borehole Data — Manganese Intelligence" },
      {
        property: "og:description",
        content: "Borehole logs supporting the prospectivity model.",
      },
    ],
  }),
  component: BoreholesPage,
});

function BoreholesPage() {
  const { mineId, selectedBoreholeId, setSelectedBoreholeId } = useMine();
  const [q, setQ] = useState("");

  const boreholes = useQuery({
    queryKey: ["boreholes", mineId],
    queryFn: () => miningService.listBoreholes(mineId!),
    enabled: !!mineId,
  });

  const rows = useMemo(() => {
    const list = boreholes.data ?? [];
    const term = q.trim().toLowerCase();
    return term ? list.filter((b) => b.borehole_code.toLowerCase().includes(term)) : list;
  }, [boreholes.data, q]);

  const activeBorehole = rows.find((b) => b.id === selectedBoreholeId);

  const avgMn =
    rows.length > 0 ? rows.reduce((s, b) => s + Number(b.mn_percent), 0) / rows.length : 0;
  const avgDepth =
    rows.length > 0 ? rows.reduce((s, b) => s + Number(b.depth_m), 0) / rows.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Borehole Register & Lithological Profiles"
        subtitle="3D subsurface orebody voxels, hyperspectral drill core logs, and assay records."
        actions={<ApproximateLocationBadge />}
      />

      {/* 3D Orebody Visualizer */}
      <OrebodyVisualizer3D />

      {/* Hyperspectral Core Analyzer */}
      <CoreSpectroscopyAnalyzer />

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel title="Records">
          <p className="font-display text-2xl font-bold">{rows.length}</p>
        </Panel>
        <Panel title="Mean Mn assay">
          <p className="font-display text-2xl font-bold">{avgMn.toFixed(2)}%</p>
        </Panel>
        <Panel title="Mean logged depth">
          <p className="font-display text-2xl font-bold">{avgDepth.toFixed(1)} m</p>
        </Panel>
      </div>

      {activeBorehole && (
        <BoreholeDetailModal
          borehole={activeBorehole}
          onClose={() => setSelectedBoreholeId(undefined)}
        />
      )}

      <Panel
        title="Borehole register"
        right={
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search borehole code…"
            className="h-9 w-56 bg-card"
            maxLength={40}
          />
        }
      >
        {rows.length === 0 ? (
          <EmptyState message="No borehole records match your search." />
        ) : (
          <div className="max-h-[560px] overflow-auto rounded-lg border border-border">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Depth (m)</TableHead>
                  <TableHead className="text-right">Mn (%)</TableHead>
                  <TableHead className="text-right">Latitude</TableHead>
                  <TableHead className="text-right">Longitude</TableHead>
                  <TableHead>Logged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => {
                  const isSelected = selectedBoreholeId === b.id;
                  return (
                    <TableRow
                      key={b.id}
                      onClick={() => setSelectedBoreholeId(isSelected ? undefined : b.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/20 font-semibold" : "hover:bg-muted/50"
                      }`}
                    >
                      <TableCell className="font-medium text-primary">{b.borehole_code}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {Number(b.depth_m).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-emerald-400 font-semibold">
                        {Number(b.mn_percent).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {b.lat.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {b.lng.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{b.logged_on}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>

      <DataSourcesPanel />

      <Panel>
        <DemoDisclaimer />
      </Panel>
    </div>
  );
}

