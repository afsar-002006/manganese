import { useState } from "react";
import {
  Compass,
  DollarSign,
  Mountain,
  Zap,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  BookmarkPlus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DrillPlanner() {
  const [sector, setSector] = useState("Sector 4-B (High Anomaly)");
  const [rigType, setRigType] = useState<"diamond" | "rc">("diamond");
  const [targetDepth, setTargetDepth] = useState(180); // meters
  const [inclination, setInclination] = useState(75); // degrees

  // Calculations
  const costPerMeter = rigType === "diamond" ? 145 : 68; // $ USD
  const totalCost = targetDepth * costPerMeter;
  const daysEstimate = Math.ceil(targetDepth / (rigType === "diamond" ? 22 : 45));

  // Ore Yield Estimation
  const estGrade = 38.5 + (targetDepth > 120 ? 4.2 : 1.5);
  const estTonnage = Math.round(targetDepth * 1400);
  const estGrossValue = Math.round((estTonnage * (estGrade / 100) * 410) / 1000) * 1000;
  const netProfit = estGrossValue - totalCost;

  function handleSaveProgram() {
    toast.success("Exploration Drilling Program Saved!", {
      description: `Target ${sector} at ${targetDepth}m depth (${rigType === "diamond" ? "Diamond Core" : "RC Rig"}). Estimated Cost: $${totalCost.toLocaleString()}`,
    });
  }

  return (
    <Card className="border-amber-500/20 bg-slate-950 text-slate-100 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-slate-800 bg-slate-900/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 ring-1 ring-amber-400/30">
              <Compass className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display text-base font-bold">Interactive Drill Plan & Target Cost Estimator</CardTitle>
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px]">
                  Exploration Feasibility
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Simulate borehole targets, rig specifications, drilling expenditure & estimated manganese recovery
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSaveProgram}
            className="h-8 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs gap-1.5"
          >
            <BookmarkPlus className="h-3.5 w-3.5" /> Save Exploration Program
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target Parameters Form */}
          <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <h4 className="font-display font-bold text-slate-200 text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="h-4 w-4 text-amber-400" /> Borehole Target Parameters
            </h4>

            {/* Target Sector Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Target Exploration Sector</label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sector 4-B (High Anomaly)">Sector 4-B (Gravity +340 nT Anomaly)</SelectItem>
                  <SelectItem value="Sector 2-North (Braunite Horizon)">Sector 2-North (Braunite Deposit)</SelectItem>
                  <SelectItem value="Sector 1-South (Folds)">Sector 1-South (Structural Fault Zone)</SelectItem>
                  <SelectItem value="Sector 5 (Infill Drilling)">Sector 5 (Infill Resource Extension)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Drill Rig Specification */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">Drill Rig Method</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={rigType === "diamond" ? "default" : "outline"}
                  onClick={() => setRigType("diamond")}
                  className={cn(
                    "h-9 text-xs justify-start px-3",
                    rigType === "diamond" ? "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold" : "border-slate-800 bg-slate-950 text-slate-300",
                  )}
                >
                  Diamond Core ($145/m)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={rigType === "rc" ? "default" : "outline"}
                  onClick={() => setRigType("rc")}
                  className={cn(
                    "h-9 text-xs justify-start px-3",
                    rigType === "rc" ? "bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold" : "border-slate-800 bg-slate-950 text-slate-300",
                  )}
                >
                  RC Drilling ($68/m)
                </Button>
              </div>
            </div>

            {/* Target Depth Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Planned Target Depth:</span>
                <span className="font-mono font-bold text-amber-300">{targetDepth} Meters</span>
              </div>
              <Slider
                value={[targetDepth]}
                min={50}
                max={350}
                step={10}
                onValueChange={([v]) => typeof v === "number" && setTargetDepth(v)}
                className="py-1"
              />
            </div>

            {/* Inclination Angle Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Drill Hole Inclination:</span>
                <span className="font-mono font-bold text-amber-300">{inclination}° Angle</span>
              </div>
              <Slider
                value={[inclination]}
                min={45}
                max={90}
                step={5}
                onValueChange={([v]) => typeof v === "number" && setInclination(v)}
                className="py-1"
              />
            </div>
          </div>

          {/* Feasibility & Financial Summary Card */}
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 p-4 space-y-4">
            <h4 className="font-display font-bold text-amber-200 text-xs flex items-center gap-2 border-b border-amber-500/20 pb-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> Projected Feasibility & Yield Return
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Est. Total Expenditure</span>
                <span className="font-display text-lg font-bold text-amber-300">
                  ${totalCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Budget Allocation</span>
              </div>

              <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Completion Time</span>
                <span className="font-display text-lg font-bold text-slate-100 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-amber-400" /> {daysEstimate} Days
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Single Shift</span>
              </div>

              <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Projected Mn Grade</span>
                <span className="font-display text-lg font-bold text-purple-300">
                  {estGrade.toFixed(1)}% Mn
                </span>
                <span className="text-[10px] text-purple-400 block mt-0.5">Metallurgical Grade</span>
              </div>

              <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Net Projected Return</span>
                <span className="font-display text-lg font-bold text-emerald-400">
                  +${netProfit.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Estimated ROI</span>
              </div>
            </div>

            <div className="rounded-lg bg-amber-500/10 p-3 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">Exploration Readiness: </span>
                Site accessible via East Access Road. Drill platform pad clearing scheduled.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
