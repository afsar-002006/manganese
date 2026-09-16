import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMine } from "@/context/MineContext";
import { miningService } from "@/services/mining-service";
import { EmptyState, PageHeader, Panel } from "@/components/app/PageHeader";
import { DemoDisclaimer } from "@/components/app/DemoBadge";
import { monthLabel, pct, tonnes } from "@/lib/format";
import { StatCard } from "@/components/app/StatCard";
import { Hammer, Target, TrendingDown, Gauge } from "lucide-react";

export const Route = createFileRoute("/_authenticated/production")({
  head: () => ({
    meta: [
      { title: "Production Forecast — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Twelve-month production history, three-month forecast and shortfall attribution for the selected manganese mine.",
      },
      { property: "og:title", content: "Production Forecast — Manganese Intelligence" },
      {
        property: "og:description",
        content: "Target versus actual output with forecast confidence and shortfall drivers.",
      },
    ],
  }),
  component: ProductionPage,
});

const axis = { stroke: "oklch(0.7 0.022 286)", fontSize: 11 };
const tooltipStyle = {
  background: "oklch(0.22 0.03 286)",
  border: "1px solid oklch(0.3 0.032 286)",
  borderRadius: 8,
  color: "white",
};

function ProductionPage() {
  const { mineId } = useMine();

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
  const drivers = useQuery({
    queryKey: ["drivers", mineId],
    queryFn: () => miningService.listShortfallDrivers(mineId!),
    enabled: !!mineId,
  });

  const history = production.data ?? [];
  const ytdActual = history.reduce((s, r) => s + Number(r.actual_tonnes), 0);
  const ytdTarget = history.reduce((s, r) => s + Number(r.target_tonnes), 0);
  const nextForecast = forecasts.data?.[0];
  const nextShortfall = nextForecast
    ? Math.max(Number(nextForecast.target_tonnes) - Number(nextForecast.predicted_tonnes), 0)
    : 0;

  const historyChart = history.map((r) => ({
    period: monthLabel(r.period),
    Target: Number(r.target_tonnes),
    Actual: Number(r.actual_tonnes),
  }));
  const forecastChart = (forecasts.data ?? []).map((r) => ({
    period: monthLabel(r.period),
    Target: Number(r.target_tonnes),
    Predicted: Number(r.predicted_tonnes),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Production Forecast"
        subtitle="Recorded output against plan, forward projection and a deterministic decomposition of the gap."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Hammer} label="Recorded output (12 mo)" value={tonnes(ytdActual)} />
        <StatCard icon={Target} label="Planned target (12 mo)" value={tonnes(ytdTarget)} />
        <StatCard
          icon={Gauge}
          label="Plan achievement"
          value={pct(ytdTarget ? (ytdActual / ytdTarget) * 100 : 0, 1)}
          tone="success"
          progress={ytdTarget ? (ytdActual / ytdTarget) * 100 : 0}
        />
        <StatCard
          icon={TrendingDown}
          label="Next-month projected shortfall"
          value={tonnes(nextShortfall)}
          sub={
            nextForecast
              ? `Model confidence ${(Number(nextForecast.confidence) * 100).toFixed(0)}% · ${nextForecast.model_version}`
              : undefined
          }
          tone={nextShortfall > 0 ? "danger" : "success"}
        />
      </div>

      <Panel title="Target vs actual — last 12 months">
        {historyChart.length === 0 ? (
          <EmptyState message="No production history recorded." />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.032 286)" />
                <XAxis dataKey="period" {...axis} />
                <YAxis {...axis} />
                <RTooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Target" fill="oklch(0.6 0.02 286)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="oklch(0.68 0.19 300)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Forward projection — next 3 months" className="xl:col-span-2">
          {forecastChart.length === 0 ? (
            <EmptyState message="No forecast available." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.032 286)" />
                  <XAxis dataKey="period" {...axis} />
                  <YAxis {...axis} />
                  <RTooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="Target"
                    stroke="oklch(0.7 0.02 286)"
                    strokeDasharray="5 4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Predicted"
                    stroke="oklch(0.68 0.19 300)"
                    strokeWidth={2.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Shortfall attribution">
          {(drivers.data ?? []).length === 0 ? (
            <EmptyState message="No attribution data." />
          ) : (
            <ul className="space-y-3">
              {drivers.data!.map((d) => (
                <li key={d.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{d.factor}</span>
                    <span className="font-semibold tabular-nums">{d.contribution_pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${d.contribution_pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel>
        <DemoDisclaimer />
      </Panel>
    </div>
  );
}
