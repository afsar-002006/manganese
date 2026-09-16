import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CloudRain, Droplets, Thermometer, ShieldAlert } from "lucide-react";
import { useMine } from "@/context/MineContext";
import { miningService } from "@/services/mining-service";
import { EmptyState, PageHeader, Panel } from "@/components/app/PageHeader";
import { DemoDisclaimer } from "@/components/app/DemoBadge";
import { StatCard } from "@/components/app/StatCard";
import { dayLabel } from "@/lib/format";

import { EsgComplianceEngine } from "@/components/app/EsgComplianceEngine";

export const Route = createFileRoute("/_authenticated/weather")({
  head: () => ({
    meta: [
      { title: "Weather Analysis — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Rainfall history and forecast with operational risk scoring for haulage and blasting windows.",
      },
      { property: "og:title", content: "Weather Analysis — Manganese Intelligence" },
      {
        property: "og:description",
        content: "Rainfall exposure and risk levels affecting mine operations.",
      },
    ],
  }),
  component: WeatherPage,
});

const RISK_STYLE: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  moderate: "bg-warning/15 text-warning",
  low: "bg-success/15 text-success",
};

function WeatherPage() {
  const { mineId } = useMine();
  const weather = useQuery({
    queryKey: ["weather", mineId],
    queryFn: () => miningService.listWeather(mineId!),
    enabled: !!mineId,
  });

  const records = weather.data ?? [];
  const forecast = records.filter((w) => w.is_forecast);
  const observed = records.filter((w) => !w.is_forecast);
  const totalRain = observed.reduce((s, w) => s + Number(w.rainfall_mm), 0);
  const peak = forecast.reduce((m, w) => Math.max(m, Number(w.rainfall_mm)), 0);
  const avgTemp =
    records.length > 0 ? records.reduce((s, w) => s + Number(w.temperature_c), 0) / records.length : 0;
  const highRiskDays = forecast.filter((w) => w.risk_level === "high").length;

  const chart = records.map((w) => ({
    day: dayLabel(w.observed_on),
    Rainfall: Number(w.rainfall_mm),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weather & Environmental Risk Analysis"
        subtitle="Rainfall exposure, Tailings Dam stability radar, and ESG environmental compliance metrics."
      />

      {/* Tailings Dam & ESG Compliance Engine */}
      <EsgComplianceEngine />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Droplets}
          label="Recorded rainfall (10 days)"
          value={`${totalRain.toFixed(0)} mm`}
        />
        <StatCard
          icon={CloudRain}
          label="Peak forecast rainfall"
          value={`${peak.toFixed(0)} mm`}
          tone={peak >= 30 ? "danger" : peak >= 10 ? "warning" : "success"}
        />
        <StatCard icon={Thermometer} label="Mean temperature" value={`${avgTemp.toFixed(1)} °C`} />
        <StatCard
          icon={ShieldAlert}
          label="High-risk days ahead"
          value={String(highRiskDays)}
          tone={highRiskDays > 0 ? "danger" : "success"}
        />
      </div>

      <Panel title="Rainfall — observed and forecast">
        {chart.length === 0 ? (
          <EmptyState message="No weather records for this mine." />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.16 195)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.72 0.16 195)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.032 286)" />
                <XAxis dataKey="day" stroke="oklch(0.7 0.022 286)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.022 286)" fontSize={11} unit=" mm" />
                <RTooltip
                  contentStyle={{
                    background: "oklch(0.22 0.03 286)",
                    border: "1px solid oklch(0.3 0.032 286)",
                    borderRadius: 8,
                    color: "white",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Rainfall"
                  stroke="oklch(0.72 0.16 195)"
                  strokeWidth={2}
                  fill="url(#rainFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel title="Forecast window">
        {forecast.length === 0 ? (
          <EmptyState message="No forecast days available." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {forecast.map((w) => (
              <li key={w.id} className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{dayLabel(w.observed_on)}</p>
                <p className="mt-1 font-display text-xl font-bold">
                  {Number(w.rainfall_mm).toFixed(0)} mm
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    RISK_STYLE[w.risk_level] ?? "bg-muted"
                  }`}
                >
                  {w.risk_level} risk
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <DemoDisclaimer />
      </Panel>
    </div>
  );
}
