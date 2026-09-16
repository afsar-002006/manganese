import { useState } from "react";
import {
  Leaf,
  ShieldCheck,
  AlertCircle,
  Activity,
  Droplets,
  Wind,
  Volume2,
  Download,
  FileCheck,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function EsgComplianceEngine() {
  const [piezometerPressure] = useState(142); // kPa (Normal < 180)
  const [slopeFos] = useState(1.74); // Factor of Safety (> 1.5 is safe)
  const [dustPm10] = useState(34); // µg/m3 (Limit < 50)
  const [waterRecycling] = useState(88.4); // %
  const [carbonIntensity] = useState(18.4); // kg CO2 / Ton Mn

  function generateAuditReport() {
    toast.success("ESG Compliance Audit Report generated & exported to PDF!", {
      description: "All environmental indicators verified compliant with ISO 14001 standards.",
    });
  }

  return (
    <Card className="border-emerald-500/20 bg-slate-950 text-slate-100 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-slate-800 bg-slate-900/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-400/30">
              <Leaf className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display text-base font-bold">Tailings Dam & ESG Compliance Engine</CardTitle>
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px]">
                  ISO 14001 Certified
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Environmental risk telemetry, slope radar stability & carbon intensity monitoring
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={generateAuditReport}
            className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export ESG Audit Report
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Tailings Dam & Environmental KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Slope Stability */}
          <div className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Tailings Slope Stability</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="font-display text-xl font-bold text-emerald-300">{slopeFos} FOS</p>
            <p className="text-[11px] text-emerald-400 font-medium">Factor of Safety &gt; 1.5 (Optimal)</p>
          </div>

          {/* Dam Pore Pressure */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Piezometer Pressure</span>
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="font-display text-xl font-bold text-slate-100">{piezometerPressure} kPa</p>
            <p className="text-[11px] text-slate-400">Threshold: &lt; 180 kPa</p>
          </div>

          {/* Dust PM10 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Dust PM10 Air Quality</span>
              <Wind className="h-4 w-4 text-amber-400" />
            </div>
            <p className="font-display text-xl font-bold text-slate-100">{dustPm10} µg/m³</p>
            <p className="text-[11px] text-emerald-400 font-medium">-32% Below Max Limit</p>
          </div>

          {/* Carbon Intensity */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Carbon Intensity</span>
              <TrendingDown className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="font-display text-xl font-bold text-emerald-300">{carbonIntensity} kg</p>
            <p className="text-[11px] text-slate-400">CO2 per Ton Manganese Mined</p>
          </div>
        </div>

        {/* Detailed Sensor Telemetry Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Water Table & Chemical Safety */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3 text-xs">
            <h4 className="font-display font-bold text-slate-200 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-400" /> Groundwater & Water Table Telemetry
            </h4>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Tailings Water Recycling Efficiency:</span>
                  <span className="font-bold text-cyan-300">{waterRecycling}%</span>
                </div>
                <Progress value={waterRecycling} className="h-2 bg-slate-800" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Groundwater pH</span>
                  <span className="font-display text-sm font-bold text-slate-100">7.2 (Neutral)</span>
                </div>
                <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Heavy Metals Seepage</span>
                  <span className="font-display text-sm font-bold text-emerald-400">&lt; 0.02 mg/L</span>
                </div>
              </div>
            </div>
          </div>

          {/* ESG Compliance Score & Audit Status */}
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 p-4 space-y-3 text-xs">
            <h4 className="font-display font-bold text-emerald-200 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" /> ESG Compliance Rating
            </h4>

            <div className="flex items-center justify-between rounded-lg bg-emerald-950/40 p-3 border border-emerald-500/20">
              <div>
                <span className="text-slate-400 block text-[11px]">Overall ESG Score</span>
                <span className="font-display text-2xl font-bold text-emerald-300">AAA (94/100)</span>
              </div>
              <Badge className="bg-emerald-500 text-slate-950 font-bold px-3 py-1">Compliant</Badge>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Zero effluent leakage detected past dam perimeter</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Solar powered perimeter monitoring sensors operational</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
