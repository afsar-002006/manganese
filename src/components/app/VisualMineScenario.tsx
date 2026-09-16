import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CloudRain,
  Truck,
  Activity,
  Layers,
  Factory,
  HardHat,
  Gauge,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { tonnes } from "@/lib/format";

export interface ScenarioInputs {
  downtimePct: number;
  rainfallMm: number;
  blastDelayHrs: number;
  oreGradePct: number;
}

export interface ScenarioOutput {
  currentForecast: number;
  scenarioForecast: number;
  delta: number;
  pctChange: number;
  aiRecommendation: string;
}

interface VisualMineScenarioProps {
  inputs: ScenarioInputs;
  output: ScenarioOutput;
  isAnalyzing: boolean;
  onRunScenario: () => void;
  onResetScenario: () => void;
}

export function VisualMineScenario({
  inputs,
  output,
  isAnalyzing,
  onRunScenario,
  onResetScenario,
}: VisualMineScenarioProps) {
  const [step, setStep] = useState<"idle" | "analyzing" | "baseline" | "applying" | "impact" | "complete">("complete");
  const [animProgress, setAnimProgress] = useState(100);
  const [displayForecast, setDisplayForecast] = useState(output.scenarioForecast);
  const animRef = useRef<number | null>(null);

  // Trigger simulation sequence when isAnalyzing becomes true or when user clicks Replay
  const runSequence = () => {
    setStep("analyzing");
    setAnimProgress(0);

    const startTime = Date.now();
    const duration = 6000; // 6 seconds sequence

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setAnimProgress(progress);

      if (elapsed < 1200) {
        setStep("analyzing");
      } else if (elapsed < 2500) {
        setStep("baseline");
      } else if (elapsed < 4000) {
        setStep("applying");
      } else if (elapsed < 5500) {
        setStep("impact");
      } else {
        setStep("complete");
      }

      if (elapsed < duration) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayForecast(output.scenarioForecast);
      }
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (isAnalyzing) {
      runSequence();
    }
  }, [isAnalyzing]);

  // Sync display forecast smoothly when output changes outside animation
  useEffect(() => {
    if (step === "complete") {
      setDisplayForecast(output.scenarioForecast);
    }
  }, [output.scenarioForecast, step]);

  const availabilityPct = Math.max(0, 100 - inputs.downtimePct);
  const isHighRain = inputs.rainfallMm > 20;
  const isHighDowntime = inputs.downtimePct > 20;
  const isBlastDelayed = inputs.blastDelayHrs > 0;

  // Truck count operating (out of 5)
  const activeTruckCount = Math.max(1, Math.round(5 * (availabilityPct / 100)));

  return (
    <div className="space-y-6 pt-2">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/80 pt-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
              DIGITAL TWIN SIMULATION
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-accent">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Live Operations Model
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mt-1">
            Visual Mine Scenario
          </h2>
          <p className="text-xs text-muted-foreground">
            Real-time digital twin visualizing operational impact across extraction, haulage, crushing & manganese output.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-semibold border-border hover:bg-muted"
            onClick={runSequence}
            disabled={step === "analyzing"}
          >
            <Play className="h-3.5 w-3.5 text-primary" />
            REPLAY SIMULATION
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            onClick={onResetScenario}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            RESET SCENARIO
          </Button>
        </div>
      </div>

      {/* Analyzing Banner Overlay (When Running Sequence) */}
      {step !== "complete" && (
        <div className="rounded-xl border border-primary/40 bg-gradient-to-r from-primary/15 via-accent/10 to-background p-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              {step === "analyzing" && "ANALYZING SCENARIO PARAMETERS..."}
              {step === "baseline" && "STEP 1/4: CHECKING MINE BASELINE CAPACITY"}
              {step === "applying" && "STEP 2/4: SIMULATING WEATHER & EQUIPMENT IMPACT"}
              {step === "impact" && "STEP 3/4: COMPUTING BOTTLENECK & FLOW RATE"}
            </div>
            <span className="font-mono text-xs font-semibold text-accent">{animProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${animProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Grid: Visual Mine Simulation + Live Status Panel */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* 1. VISUAL MINE SIMULATION CANVAS (2D/2.5D Open-Pit Digital Twin) */}
        <div className="panel glow-ring relative overflow-hidden p-0 xl:col-span-2 flex flex-col justify-between min-h-[460px]">
          {/* Header Bar inside Canvas */}
          <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-display font-semibold text-foreground">
                MOIL Open-Pit Mining Complex — Digital Twin
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isHighDowntime ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                Fleet: {activeTruckCount}/5 Active
              </span>
              <span className="flex items-center gap-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    inputs.rainfallMm > 0 ? "bg-cyan-400" : "bg-slate-400"
                  }`}
                />
                Rain: {inputs.rainfallMm}mm
              </span>
            </div>
          </div>

          {/* Interactive Digital Twin Visual Canvas */}
          <div className="relative flex-1 w-full bg-[#0C0A17] overflow-hidden p-4">
            {/* Grid Lines Pattern */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1E1A38_1px,transparent_1px),linear-gradient(to_bottom,#1E1A38_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

            {/* Rain Weather Effect Overlay */}
            {inputs.rainfallMm > 0 && (
              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                <div
                  className="h-full w-full opacity-60 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] bg-[size:16px_16px] animate-[pulse_1.5s_infinite]"
                  style={{ opacity: Math.min(0.8, inputs.rainfallMm / 40) }}
                />
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-md bg-cyan-950/90 border border-cyan-500/40 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 backdrop-blur">
                  <CloudRain className="h-3.5 w-3.5 animate-bounce text-cyan-400" />
                  <span>Monsoon Rainfall ({inputs.rainfallMm} mm) — Haul Roads Wet</span>
                </div>
              </div>
            )}

            {/* SVG Interactive Mine Structure */}
            <svg className="w-full h-full min-h-[360px]" viewBox="0 0 800 400" fill="none">
              <defs>
                {/* Gradients */}
                <linearGradient id="pitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1B1633" />
                  <stop offset="50%" stopColor="#130F26" />
                  <stop offset="100%" stopColor="#0B0916" />
                </linearGradient>

                <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={inputs.rainfallMm > 0 ? "#1e3a5f" : "#2a2444"} />
                  <stop offset="100%" stopColor={inputs.rainfallMm > 0 ? "#0f2b48" : "#1b1633"} />
                </linearGradient>

                <linearGradient id="manganeseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Terraced Open-Pit Benches */}
              {/* Bench 1 (Outer Top Level) */}
              <polygon points="40,40 760,40 720,360 80,360" fill="url(#pitGradient)" stroke="#2D2552" strokeWidth="2" />
              
              {/* Bench 2 (Mid Level) */}
              <polygon points="100,90 700,90 660,320 140,320" fill="#15102A" stroke="#3B316A" strokeWidth="1.5" />
              
              {/* Bench 3 (Pit Bottom Extraction Zone) */}
              <polygon points="170,140 630,140 590,270 210,270" fill="#100C21" stroke="#4C3E88" strokeWidth="1.5" />

              {/* Haulage Winding Road */}
              <path
                d="M 230,240 C 350,240 450,180 550,180 C 650,180 680,100 580,70 C 480,40 380,60 250,55"
                stroke={inputs.rainfallMm > 0 ? "#38bdf8" : "#4A3E78"}
                strokeWidth={inputs.rainfallMm > 0 ? "8" : "6"}
                strokeDasharray="4 2"
                fill="none"
              />

              {/* Bench Elevation Labels */}
              <text x="50" y="60" fill="#7E76A8" fontSize="10" fontFamily="monospace" fontWeight="bold">BENCH #1 (320m)</text>
              <text x="110" y="110" fill="#7E76A8" fontSize="10" fontFamily="monospace" fontWeight="bold">BENCH #2 (280m)</text>
              <text x="180" y="160" fill="#A799E8" fontSize="10" fontFamily="monospace" fontWeight="bold">EXTRACTION PIT FLOOR (240m)</text>

              {/* EXTRACTION ZONE & EXCAVATOR (Bottom Left Pit) */}
              <g transform="translate(220, 200)">
                {/* Blast Zone Outline */}
                <rect
                  x="-30"
                  y="-25"
                  width="120"
                  height="60"
                  rx="6"
                  fill={isBlastDelayed ? "#451a03" : "#1e1b4b"}
                  stroke={isBlastDelayed ? "#f59e0b" : "#8b5cf6"}
                  strokeWidth="1.5"
                  strokeDasharray={isBlastDelayed ? "4 4" : "none"}
                />
                <text x="-22" y="-10" fill={isBlastDelayed ? "#fbbf24" : "#c084fc"} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  {isBlastDelayed ? `⚠️ BLAST DELAYED (${inputs.blastDelayHrs}h)` : "⚡ ACTIVE EXTRACTION"}
                </text>
                
                {/* Excavator Arm Graphic */}
                <circle cx="20" cy="15" r="12" fill="#8b5cf6" opacity="0.3" />
                <path d="M 0,20 L 20,10 L 40,22" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
                <rect x="35" y="16" width="12" height="12" rx="2" fill="#d8b4fe" />
                <text x="-22" y="25" fill="#e9d5ff" fontSize="9" fontWeight="600">EXCAVATOR #04</text>
              </g>

              {/* HAUL TRUCKS ON ROAD */}
              {/* Truck 1 */}
              <g transform="translate(360, 195)">
                <rect x="-12" y="-8" width="24" height="16" rx="3" fill="#8b5cf6" stroke="#c084fc" strokeWidth="1" />
                <rect x="4" y="-6" width="6" height="12" rx="1" fill="#38bdf8" />
                <circle cx="-6" cy="8" r="3" fill="#000" />
                <circle cx="6" cy="8" r="3" fill="#000" />
                <text x="-15" y="-12" fill="#c084fc" fontSize="8" fontWeight="bold">TRUCK 1</text>
              </g>

              {/* Truck 2 (Condition check: parked/maintenance if downtime high) */}
              <g transform="translate(560, 140)">
                {isHighDowntime ? (
                  <>
                    <rect x="-12" y="-8" width="24" height="16" rx="3" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="-25" y="-12" fill="#fbbf24" fontSize="8" fontWeight="bold">TRUCK 2 (DOWN)</text>
                  </>
                ) : (
                  <>
                    <rect x="-12" y="-8" width="24" height="16" rx="3" fill="#8b5cf6" stroke="#c084fc" strokeWidth="1" />
                    <rect x="4" y="-6" width="6" height="12" rx="1" fill="#38bdf8" />
                    <text x="-15" y="-12" fill="#c084fc" fontSize="8" fontWeight="bold">TRUCK 2</text>
                  </>
                )}
                <circle cx="-6" cy="8" r="3" fill="#000" />
                <circle cx="6" cy="8" r="3" fill="#000" />
              </g>

              {/* CRUSHER & PROCESSING PLANT (Top Right) */}
              <g transform="translate(620, 50)">
                <rect x="-40" y="-20" width="80" height="50" rx="8" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
                <circle cx="0" cy="-5" r="10" fill="#312e81" stroke="#c084fc" strokeWidth="1.5" className="animate-spin" />
                <path d="M -5,-5 L 5,-5 M 0,-10 L 0,0" stroke="#c084fc" strokeWidth="2" />
                <text x="-32" y="20" fill="#e9d5ff" fontSize="9" fontWeight="bold">CRUSHER PLANT</text>
                <text x="-32" y="30" fill="#a799e8" fontSize="8">CAPACITY: 140 T/h</text>
              </g>

              {/* ORE STOCKPILE (Top Center/Left Output) */}
              <g transform="translate(230, 45)">
                <path d="M -30,15 Q 0,-20 30,15 Z" fill="#581c87" stroke="#c084fc" strokeWidth="1.5" />
                <text x="-38" y="28" fill="#f0abfc" fontSize="9" fontWeight="bold">
                  STOCKPILE ({inputs.oreGradePct}% Mn)
                </text>
              </g>

              {/* PRODUCTION FLOW PARTICLES ALONG PIPELINE */}
              <path
                id="flowPath"
                d="M 230,230 L 360,195 L 560,140 L 620,70 L 230,60"
                stroke="none"
                fill="none"
              />

              {/* Animated Glowing Particles along Flow Path */}
              <circle r="4" fill="#f0abfc" filter="url(#purpleGlow)">
                <animateMotion path="M 230,230 L 360,195 L 560,140 L 620,70 L 230,60" dur={isHighRain || isHighDowntime ? "8s" : "4s"} repeatCount="indefinite" />
              </circle>
              <circle r="3" fill="#38bdf8">
                <animateMotion path="M 230,230 L 360,195 L 560,140 L 620,70 L 230,60" dur={isHighRain || isHighDowntime ? "8s" : "4s"} begin="1.5s" repeatCount="indefinite" />
              </circle>
              <circle r="4" fill="#a855f7" filter="url(#purpleGlow)">
                <animateMotion path="M 230,230 L 360,195 L 560,140 L 620,70 L 230,60" dur={isHighRain || isHighDowntime ? "8s" : "4s"} begin="3s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          {/* 5. PRODUCTION FLOW PIPELINE INDICATOR */}
          <div className="border-t border-border/80 bg-muted/30 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
              <span>Production Pipeline Flow Rate</span>
              <span className="text-primary font-mono font-semibold">
                {output.pctChange >= 0 ? "OPTIMAL THROUGHPUT" : "REDUCED FLOW RATE"}
              </span>
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg border border-border bg-card p-2">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">1. Extraction</p>
                <p className="font-display font-bold text-foreground mt-0.5">
                  {isBlastDelayed ? "PAUSED" : "ACTIVE"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-2">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">2. Hauling</p>
                <p className="font-display font-bold text-foreground mt-0.5">
                  {activeTruckCount}/5 Trucks
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-2">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">3. Processing</p>
                <p className="font-display font-bold text-foreground mt-0.5">
                  {inputs.rainfallMm > 25 ? "85 T/h" : "125 T/h"}
                </p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-2">
                <p className="text-[10px] text-primary uppercase font-bold">4. Mn Output</p>
                <p className="font-display font-bold text-primary mt-0.5">
                  {inputs.oreGradePct}% Mn
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. LIVE STATUS PANEL & RESULTS CARD */}
        <div className="space-y-5 flex flex-col justify-between">
          {/* Live Scenario Conditions Panel */}
          <div className="panel space-y-4">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-3">
              <Gauge className="h-4 w-4 text-primary" />
              Scenario Conditions
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <HardHat className="h-3.5 w-3.5 text-primary" />
                  Equipment Availability
                </span>
                <span className="font-mono font-bold text-foreground">
                  {availabilityPct}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CloudRain className="h-3.5 w-3.5 text-cyan-400" />
                  Rainfall Exposure
                </span>
                <span className="font-mono font-bold text-foreground">
                  {inputs.rainfallMm} mm
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Blast Delay
                </span>
                <span className="font-mono font-bold text-foreground">
                  {inputs.blastDelayHrs} hrs
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-purple-400" />
                  Ore Grade
                </span>
                <span className="font-mono font-bold text-foreground">
                  {inputs.oreGradePct}% Mn
                </span>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="font-semibold text-foreground">Production Impact</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    output.pctChange >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {output.pctChange >= 0 ? "+" : ""}
                  {output.pctChange}%
                </span>
              </div>
            </div>
          </div>

          {/* 6. SCENARIO RESULT CARD */}
          <div className="panel space-y-4 glow-ring border-primary/40 bg-gradient-to-b from-card to-primary/5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              Simulated Forecast Result
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">CURRENT FORECAST</p>
                <p className="font-display text-lg font-bold text-foreground mt-1">
                  {tonnes(output.currentForecast)}
                </p>
              </div>
              <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
                <p className="text-[10px] text-primary uppercase font-bold">SCENARIO FORECAST</p>
                <p className="font-display text-xl font-bold text-primary mt-1 transition-all duration-500">
                  {tonnes(displayForecast)}
                </p>
              </div>
            </div>

            {/* Change Metrics */}
            <div
              className={`rounded-lg border p-3 flex items-center justify-between ${
                output.pctChange >= 0
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {output.pctChange >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider">CHANGE TONNAGE</p>
                  <p className="text-sm font-bold">
                    {output.pctChange >= 0 ? "+" : ""}
                    {tonnes(output.delta)}
                  </p>
                </div>
              </div>
              <span className="font-display text-2xl font-bold tabular-nums">
                {output.pctChange >= 0 ? "+" : ""}
                {output.pctChange}%
              </span>
            </div>

            {/* 7. AI RECOMMENDATION CARD */}
            <div className="rounded-xl border border-accent/40 bg-accent/10 p-3.5 space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
                <Sparkles className="h-4 w-4" /> ✦ AI RECOMMENDATION
              </p>
              <p className="text-xs font-medium text-foreground leading-relaxed">
                &ldquo;{output.aiRecommendation}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
