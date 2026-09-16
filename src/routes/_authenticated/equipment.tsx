import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Truck, Wrench, PauseCircle, Gauge } from "lucide-react";
import { useMine } from "@/context/MineContext";
import { miningService } from "@/services/mining-service";
import { EmptyState, PageHeader, Panel } from "@/components/app/PageHeader";
import { DemoDisclaimer } from "@/components/app/DemoBadge";
import { StatCard } from "@/components/app/StatCard";
import { pct } from "@/lib/format";
import { DigitalTwinPit } from "@/components/app/DigitalTwinPit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/equipment")({
  head: () => ({
    meta: [
      { title: "Equipment Analytics — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Fleet availability, utilisation and maintenance status for excavators, haul trucks, drill rigs and loaders.",
      },
      { property: "og:title", content: "Equipment Analytics — Manganese Intelligence" },
      {
        property: "og:description",
        content: "Asset-level availability and utilisation for the selected mine.",
      },
    ],
  }),
  component: EquipmentPage,
});

const STATUS_STYLE: Record<string, string> = {
  operational: "bg-success/15 text-success",
  maintenance: "bg-warning/15 text-warning",
  idle: "bg-muted text-muted-foreground",
};

function EquipmentPage() {
  const { mineId } = useMine();
  const equipment = useQuery({
    queryKey: ["equipment", mineId],
    queryFn: () => miningService.listEquipment(mineId!),
    enabled: !!mineId,
  });

  const assets = equipment.data ?? [];
  const avgAvail =
    assets.length > 0 ? assets.reduce((s, e) => s + Number(e.availability_pct), 0) / assets.length : 0;
  const avgUtil =
    assets.length > 0 ? assets.reduce((s, e) => s + Number(e.utilisation_pct), 0) / assets.length : 0;
  const inMaintenance = assets.filter((e) => e.status === "maintenance").length;
  const idle = assets.filter((e) => e.status === "idle").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment Analytics & 3D Digital Twin"
        subtitle="Real-time pit fleet telemetry, bench location tracking, availability and utilisation statistics."
      />

      {/* Digital Twin 3D Pit & Live Fleet Telemetry */}
      <DigitalTwinPit />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Truck}
          label="Fleet availability"
          value={pct(avgAvail, 1)}
          progress={avgAvail}
          tone="success"
        />
        <StatCard
          icon={Gauge}
          label="Fleet utilisation"
          value={pct(avgUtil, 1)}
          progress={avgUtil}
          tone="accent"
        />
        <StatCard icon={Wrench} label="In maintenance" value={String(inMaintenance)} tone="warning" />
        <StatCard icon={PauseCircle} label="Idle assets" value={String(idle)} tone="danger" />
      </div>

      <Panel title="Asset register">
        {assets.length === 0 ? (
          <EmptyState message="No equipment recorded for this mine." />
        ) : (
          <div className="overflow-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assigned zone</TableHead>
                  <TableHead className="text-right">Availability</TableHead>
                  <TableHead className="text-right">Utilisation</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.asset_code}</TableCell>
                    <TableCell className="text-muted-foreground">{e.asset_type}</TableCell>
                    <TableCell className="text-muted-foreground">{e.assigned_zone ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${e.availability_pct}%` }}
                          />
                        </div>
                        <span className="tabular-nums">{Number(e.availability_pct).toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(e.utilisation_pct).toFixed(0)}%
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                          STATUS_STYLE[e.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {e.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>

      <Panel>
        <DemoDisclaimer />
      </Panel>
    </div>
  );
}
