import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { Loader2, Play, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { useMine } from "@/context/MineContext";
import { miningService } from "@/services/mining-service";
import { runScenario } from "@/lib/mining.functions";
import { EmptyState, PageHeader, Panel } from "@/components/app/PageHeader";
import { DemoDisclaimer } from "@/components/app/DemoBadge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tonnes } from "@/lib/format";
import { VisualMineScenario } from "@/components/app/VisualMineScenario";

export const Route = createFileRoute("/_authenticated/simulator")({
  head: () => ({
    meta: [
      { title: "What-If Scenario Simulator — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Model how equipment downtime, rainfall, blast delay and ore grade change projected manganese output.",
      },
      { property: "og:title", content: "What-If Scenario Simulator — Manganese Intelligence" },
      {
        property: "og:description",
        content: "What-if modelling for production planning decisions.",
      },
    ],
  }),
  component: SimulatorPage,
});

const CONTROLS = [
  { key: "downtimePct", label: "Equipment Downtime", min: 0, max: 40, step: 1, unit: "%" },
  { key: "rainfallMm", label: "Rainfall", min: 0, max: 50, step: 1, unit: " mm" },
  { key: "blastDelayHrs", label: "Blast Delay", min: 0, max: 12, step: 0.5, unit: " hrs" },
  { key: "oreGradePct", label: "Ore Grade", min: 4, max: 18, step: 0.2, unit: "% Mn" },
] as const;

type Inputs = {
  downtimePct: number;
  rainfallMm: number;
  blastDelayHrs: number;
  oreGradePct: number;
};

function num(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function SimulatorPage() {
  const { mineId } = useMine();
  const qc = useQueryClient();
  const simulate = useServerFn(runScenario);
  const [name, setName] = useState("Operational Optimization Scenario");
  
  const [inputs, setInputs] = useState<Inputs>({
    downtimePct: 12,
    rainfallMm: 5,
    blastDelayHrs: 2,
    oreGradePct: 8.5,
  });

  const [executed, setExecuted] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Baseline forecast
  const currentBaseline = 82400;

  // Deterministic local simulation calculation
  const calculatedOutput = useMemo(() => {
    const downtimeFactor = 1 - inputs.downtimePct * 0.009;
    const rainFactor = 1 - inputs.rainfallMm * 0.006;
    const blastFactor = 1 - inputs.blastDelayHrs * 0.015;
    const gradeFactor = inputs.oreGradePct / 7.8;

    const projected = Math.round(
      currentBaseline * downtimeFactor * rainFactor * blastFactor * gradeFactor,
    );
    const delta = projected - currentBaseline;
    const pctChange = Number(((delta / currentBaseline) * 100).toFixed(1));

    let aiRecommendation = "";
    if (inputs.downtimePct > 20) {
      aiRecommendation = "Reduce equipment downtime below 10% to protect production throughput.";
    } else if (inputs.rainfallMm > 25) {
      aiRecommendation = "Schedule critical extraction activities outside high-rainfall periods and pre-drain haul roads.";
    } else if (inputs.blastDelayHrs > 4) {
      aiRecommendation = "Optimize blast scheduling to minimize downstream production losses at bench #3.";
    } else if (inputs.oreGradePct > 10) {
      aiRecommendation = "Prioritize higher-grade zones to maintain production quality and tonnage.";
    } else {
      aiRecommendation = "Maintaining equipment availability above 85% yields the optimal balance of throughput.";
    }

    return {
      currentForecast: currentBaseline,
      scenarioForecast: projected,
      delta,
      pctChange,
      aiRecommendation,
    };
  }, [inputs]);

  const runs = useQuery({
    queryKey: ["scenarios", mineId],
    queryFn: () => miningService.listScenarioRuns(mineId!),
    enabled: !!mineId,
  });

  const handleRun = () => {
    setExecuted(true);
    setIsAnalyzing(true);
    toast.success("Scenario simulation executed!");
    setTimeout(() => setIsAnalyzing(false), 300);
  };

  const handleReset = () => {
    setInputs({
      downtimePct: 12,
      rainfallMm: 5,
      blastDelayHrs: 2,
      oreGradePct: 8.5,
    });
    setExecuted(true);
    setIsAnalyzing(true);
    toast.info("Scenario reset to default baseline values.");
    setTimeout(() => setIsAnalyzing(false), 300);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="What-If Scenario Simulator"
        subtitle="Adjust operating controls to model projected manganese output and view instant AI optimization recommendations."
      />

      <div className="grid gap-5 xl:grid-cols-3">
        {/* Controls Panel */}
        <Panel title="Scenario Controls" className="xl:col-span-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {CONTROLS.map((c) => (
              <div key={c.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Label>{c.label}</Label>
                  <span className="font-display font-semibold tabular-nums text-primary">
                    {inputs[c.key]}
                    {c.unit}
                  </span>
                </div>
                <Slider
                  value={[inputs[c.key]]}
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  onValueChange={(v) =>
                    setInputs((s) => ({ ...s, [c.key]: v[0] ?? s[c.key] }))
                  }
                />
              </div>
            ))}

            <Button onClick={handleRun} disabled={!mineId} className="w-full gap-2 font-semibold">
              <Play className="h-4 w-4" />
              RUN SCENARIO
            </Button>
          </div>
        </Panel>

        {/* Results Panel */}
        <Panel title="Simulation Results">
          {!executed ? (
            <EmptyState message="Adjust sliders and click RUN SCENARIO." />
          ) : (
            <div className="space-y-4">
              {/* Forecast Comparison */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <div>
                  <p className="text-[11px] text-muted-foreground">CURRENT FORECAST</p>
                  <p className="font-display text-xl font-bold text-foreground">
                    {tonnes(calculatedOutput.currentForecast)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">SCENARIO FORECAST</p>
                  <p className="font-display text-xl font-bold text-primary">
                    {tonnes(calculatedOutput.scenarioForecast)}
                  </p>
                </div>
              </div>

              {/* Percentage Change */}
              <div
                className={`rounded-lg border p-3 flex items-center justify-between ${
                  calculatedOutput.pctChange >= 0
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  {calculatedOutput.pctChange >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold">CHANGE</p>
                    <p className="text-sm font-bold">
                      {calculatedOutput.pctChange >= 0 ? "+" : ""}
                      {tonnes(calculatedOutput.delta)}
                    </p>
                  </div>
                </div>
                <span className="font-display text-2xl font-bold tabular-nums">
                  {calculatedOutput.pctChange >= 0 ? "+" : ""}
                  {calculatedOutput.pctChange}%
                </span>
              </div>

              {/* AI Recommendation */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="h-4 w-4" /> AI RECOMMENDATION
                </p>
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  &ldquo;{calculatedOutput.aiRecommendation}&rdquo;
                </p>
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* NEW SECTION: VISUAL MINE SCENARIO (Digital Twin & Animated Flow Pipeline) */}
      <VisualMineScenario
        inputs={inputs}
        output={calculatedOutput}
        isAnalyzing={isAnalyzing}
        onRunScenario={handleRun}
        onResetScenario={handleReset}
      />

      <Panel>
        <DemoDisclaimer />
      </Panel>
    </div>
  );
}

