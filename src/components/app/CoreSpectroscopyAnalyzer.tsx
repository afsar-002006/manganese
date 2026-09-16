import { useState } from "react";
import {
  Scan,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
  Eye,
  Sliders,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CoreInterval {
  depthInterval: string; // e.g. "140.0m - 141.0m"
  mnGrade: number;
  feGrade: number;
  sio2Grade: number;
  pGrade: number;
  rqd: number; // %
  rockName: string;
}

const SAMPLE_CORES: CoreInterval[] = [
  {
    depthInterval: "140.0m - 141.0m",
    mnGrade: 44.8,
    feGrade: 4.2,
    sio2Grade: 7.8,
    pGrade: 0.03,
    rqd: 92,
    rockName: "Massive Braunite Manganese Ore",
  },
  {
    depthInterval: "141.0m - 142.0m",
    mnGrade: 46.2,
    feGrade: 3.8,
    sio2Grade: 6.5,
    pGrade: 0.02,
    rqd: 88,
    rockName: "High Grade Pyrolusite Matrix",
  },
  {
    depthInterval: "142.0m - 143.0m",
    mnGrade: 38.5,
    feGrade: 7.9,
    sio2Grade: 12.1,
    pGrade: 0.05,
    rqd: 74,
    rockName: "Ferruginous Manganese Shale",
  },
  {
    depthInterval: "143.0m - 144.0m",
    mnGrade: 42.1,
    feGrade: 5.1,
    sio2Grade: 9.4,
    pGrade: 0.04,
    rqd: 85,
    rockName: "Band Braunite Ore",
  },
  {
    depthInterval: "144.0m - 145.0m",
    mnGrade: 29.4,
    feGrade: 14.2,
    sio2Grade: 22.0,
    pGrade: 0.08,
    rqd: 62,
    rockName: "Siliceous Basal Contact Shale",
  },
];

export function CoreSpectroscopyAnalyzer() {
  const [scanMode, setScanMode] = useState<"rgb" | "hyperspectral">("hyperspectral");
  const [selectedInterval, setSelectedInterval] = useState<CoreInterval>(SAMPLE_CORES[1]!);

  return (
    <Card className="border-purple-500/20 bg-slate-950 text-slate-100 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-slate-800 bg-slate-900/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 ring-1 ring-purple-400/30">
              <Scan className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display text-base font-bold">Hyperspectral Core Sample & Assay Analyzer</CardTitle>
                <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-300 text-[10px]">
                  SWIR Spectroscopy
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Core tray hyperspectral IR scanning, RQD rock quality & elemental assay breakdown (Borehole BH-104)
              </p>
            </div>
          </div>

          {/* Scan Mode Toggle */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 p-1">
            <Button
              size="sm"
              variant={scanMode === "rgb" ? "default" : "ghost"}
              onClick={() => setScanMode("rgb")}
              className={cn("h-7 text-xs px-2.5", scanMode === "rgb" ? "bg-purple-600 text-white" : "text-slate-400")}
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Standard RGB
            </Button>
            <Button
              size="sm"
              variant={scanMode === "hyperspectral" ? "default" : "ghost"}
              onClick={() => setScanMode("hyperspectral")}
              className={cn("h-7 text-xs px-2.5", scanMode === "hyperspectral" ? "bg-purple-600 text-white" : "text-slate-400")}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-300" /> Hyperspectral IR Scan
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Core Tray Tray Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Drill Core Tray #04 (Depth 140m - 145m)</span>
            <span className="text-slate-400 font-mono">Borehole: BH-104</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {SAMPLE_CORES.map((core) => {
              const isSelected = selectedInterval.depthInterval === core.depthInterval;

              return (
                <button
                  key={core.depthInterval}
                  onClick={() => setSelectedInterval(core)}
                  className={cn(
                    "group relative flex flex-col rounded-xl border p-2.5 text-left transition-all overflow-hidden",
                    isSelected
                      ? "border-purple-400 bg-purple-950/40 ring-2 ring-purple-500/40"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700",
                  )}
                >
                  {/* Visual Core Bar Simulation */}
                  <div className="h-10 w-full rounded-lg overflow-hidden relative mb-2 border border-slate-800">
                    {scanMode === "hyperspectral" ? (
                      <div
                        className="h-full w-full"
                        style={{
                          background:
                            core.mnGrade >= 40
                              ? "linear-gradient(90deg, #9333ea, #c084fc, #ec4899)"
                              : core.mnGrade >= 30
                              ? "linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)"
                              : "linear-gradient(90deg, #475569, #64748b, #ef4444)",
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-zinc-800 via-stone-700 to-zinc-900" />
                    )}
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold bg-slate-950/80 px-1 rounded text-slate-200">
                      {core.mnGrade}% Mn
                    </span>
                  </div>

                  <span className="font-mono text-[11px] font-bold text-slate-200">{core.depthInterval}</span>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">{core.rockName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Core Assay Breakdown Details */}
        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
            <div>
              <span className="text-xs text-purple-300 font-bold block">Assay Interval: {selectedInterval.depthInterval}</span>
              <span className="text-xs text-slate-300 font-medium">{selectedInterval.rockName}</span>
            </div>
            <Badge className="bg-purple-600 text-white font-bold">RQD Score: {selectedInterval.rqd}% (Competent Rock)</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Manganese % */}
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Manganese (Mn)</span>
              <span className="font-display text-lg font-bold text-purple-300">{selectedInterval.mnGrade}%</span>
              <Progress value={(selectedInterval.mnGrade / 50) * 100} className="h-1.5 bg-slate-800 mt-1.5" />
            </div>

            {/* Iron % */}
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Iron (Fe)</span>
              <span className="font-display text-lg font-bold text-red-300">{selectedInterval.feGrade}%</span>
              <Progress value={(selectedInterval.feGrade / 20) * 100} className="h-1.5 bg-slate-800 mt-1.5" />
            </div>

            {/* Silica % */}
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Silica (SiO2)</span>
              <span className="font-display text-lg font-bold text-cyan-300">{selectedInterval.sio2Grade}%</span>
              <Progress value={(selectedInterval.sio2Grade / 30) * 100} className="h-1.5 bg-slate-800 mt-1.5" />
            </div>

            {/* Phosphorus % */}
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Phosphorus (P)</span>
              <span className="font-display text-lg font-bold text-amber-300">{selectedInterval.pGrade}%</span>
              <Progress value={(selectedInterval.pGrade / 0.1) * 100} className="h-1.5 bg-slate-800 mt-1.5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
