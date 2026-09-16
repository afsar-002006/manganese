import { useState, useEffect } from "react";
import {
  Truck,
  Zap,
  Activity,
  AlertTriangle,
  Radio,
  Fuel,
  Gauge,
  ShieldCheck,
  RefreshCw,
  Navigation,
  Compass,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FleetVehicle {
  id: string;
  name: string;
  type: "Haul Truck" | "Excavator" | "Drill Rig";
  status: "Active - Hauling" | "Active - Loading" | "Active - Drilling" | "Maintenance Warning";
  speed: number; // km/h
  payload: number; // tons
  maxPayload: number;
  fuel: number; // %
  temp: number; // °C
  tirePressure: number; // PSI
  benchLevel: string;
  coords: { x: number; y: number }; // percentage on map
}

const INITIAL_FLEET: FleetVehicle[] = [
  {
    id: "HT-101",
    name: "Caterpillar 793F",
    type: "Haul Truck",
    status: "Active - Hauling",
    speed: 32,
    payload: 94,
    maxPayload: 100,
    fuel: 82,
    temp: 84,
    tirePressure: 118,
    benchLevel: "Bench #3 (-110m)",
    coords: { x: 35, y: 45 },
  },
  {
    id: "HT-102",
    name: "Komatsu HD785",
    type: "Haul Truck",
    status: "Active - Hauling",
    speed: 28,
    payload: 88,
    maxPayload: 95,
    fuel: 65,
    temp: 81,
    tirePressure: 115,
    benchLevel: "Haul Ramp East",
    coords: { x: 55, y: 35 },
  },
  {
    id: "EX-01",
    name: "Liebherr R9800",
    type: "Excavator",
    status: "Active - Loading",
    speed: 0,
    payload: 42,
    maxPayload: 45,
    fuel: 74,
    temp: 88,
    tirePressure: 0,
    benchLevel: "High Grade Face (-140m)",
    coords: { x: 25, y: 65 },
  },
  {
    id: "DR-02",
    name: "Epiroc Pit Viper",
    type: "Drill Rig",
    status: "Active - Drilling",
    speed: 0,
    payload: 0,
    maxPayload: 0,
    fuel: 91,
    temp: 76,
    tirePressure: 0,
    benchLevel: "Sector 4 Crest (-20m)",
    coords: { x: 75, y: 25 },
  },
  {
    id: "HT-104",
    name: "Hitachi EH5000",
    type: "Haul Truck",
    status: "Maintenance Warning",
    speed: 12,
    payload: 98,
    maxPayload: 100,
    fuel: 24,
    temp: 96, // Warning high temp
    tirePressure: 102,
    benchLevel: "Primary Crusher Ramp",
    coords: { x: 80, y: 70 },
  },
];

export function DigitalTwinPit() {
  const [fleet, setFleet] = useState<FleetVehicle[]>(INITIAL_FLEET);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle>(INITIAL_FLEET[0]!);

  // Live animation position updates
  useEffect(() => {
    const interval = setInterval(() => {
      setFleet((prevFleet) =>
        prevFleet.map((v) => {
          if (v.type === "Haul Truck") {
            const dx = (Math.random() - 0.48) * 3;
            const dy = (Math.random() - 0.48) * 3;
            const newX = Math.max(15, Math.min(85, v.coords.x + dx));
            const newY = Math.max(15, Math.min(85, v.coords.y + dy));
            const speed = Math.round(20 + Math.random() * 16);
            return { ...v, coords: { x: newX, y: newY }, speed };
          }
          return v;
        }),
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-cyan-500/20 bg-slate-950 text-slate-100 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-slate-800 bg-slate-900/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 ring-1 ring-cyan-400/30">
              <Truck className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display text-base font-bold">3D Digital Twin Pit & Live Fleet Telemetry</CardTitle>
                <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-[10px]">
                  Real-time Telemetry
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Open-pit bench telemetry, equipment collision radar & haul cycle status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 border-emerald-500/40 text-emerald-400 text-xs">
              <Radio className="h-3 w-3 mr-1 animate-pulse" /> 5 Active Units
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Isometric Mine Pit Map Viewport */}
          <div className="lg:col-span-2 relative h-[450px] rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-zinc-950 overflow-hidden group">
            {/* SVG Pit Benches & Topography Overlay */}
            <svg className="absolute inset-0 h-full w-full opacity-40 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Concentric Pit Benches */}
              <ellipse cx="50" cy="50" rx="46" ry="38" fill="none" stroke="#475569" strokeWidth="0.8" strokeDasharray="2,2" />
              <ellipse cx="50" cy="50" rx="36" ry="28" fill="none" stroke="#64748b" strokeWidth="1" />
              <ellipse cx="50" cy="50" rx="26" ry="19" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
              <ellipse cx="50" cy="50" rx="15" ry="10" fill="none" stroke="#c084fc" strokeWidth="1.5" />

              {/* Haul Roads Ramp Path */}
              <path d="M 5,50 Q 30,20 50,15 T 85,30 T 70,75 T 30,70 Z" fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="1,1" />

              {/* Crusher Plant & Waste Dump Markers */}
              <rect x="80" y="65" width="12" height="12" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="0.8" />
              <text x="81" y="62" fontSize="3" fill="#38bdf8" fontWeight="bold">Crusher Plant</text>
            </svg>

            {/* Pit Map Header Overlay */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs backdrop-blur border border-slate-800">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-mono text-[11px] text-slate-300">BENCH ELEVATION: -140m to +20m</span>
            </div>

            {/* Moving Fleet Vehicles on Map */}
            {fleet.map((v) => {
              const isSelected = selectedVehicle.id === v.id;
              const isWarn = v.status === "Maintenance Warning";

              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  style={{ left: `${v.coords.x}%`, top: `${v.coords.y}%` }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group transition-all duration-700",
                    isSelected ? "scale-125 z-30" : "hover:scale-110",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl shadow-lg border text-white font-bold transition-all",
                      isWarn
                        ? "bg-red-600 border-red-400 animate-bounce"
                        : isSelected
                        ? "bg-cyan-600 border-cyan-300 ring-4 ring-cyan-500/40"
                        : "bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700",
                    )}
                  >
                    <Truck className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold shadow-md backdrop-blur border whitespace-nowrap",
                      isWarn
                        ? "bg-red-950/90 text-red-300 border-red-500/50"
                        : isSelected
                        ? "bg-cyan-950/90 text-cyan-300 border-cyan-400/50"
                        : "bg-slate-900/80 text-slate-300 border-slate-700",
                    )}
                  >
                    {v.id} ({v.speed} km/h)
                  </span>
                </button>
              );
            })}

            {/* Map Controls */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>GPS Telemetry Active</span>
            </div>
          </div>

          {/* Telemetry Detail Sidebar */}
          <div className="space-y-3">
            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-300 text-xs">
                    {selectedVehicle.type}
                  </Badge>
                  <span className="font-mono text-xs text-slate-400">{selectedVehicle.benchLevel}</span>
                </div>
                <CardTitle className="font-display text-lg font-bold text-slate-100 flex items-center justify-between mt-1">
                  <span>{selectedVehicle.id}</span>
                  <span className="text-xs text-slate-400 font-normal">{selectedVehicle.name}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {/* Status Alert Banner */}
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg p-2.5 font-medium border",
                    selectedVehicle.status === "Maintenance Warning"
                      ? "border-red-500/40 bg-red-500/10 text-red-300"
                      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                  )}
                >
                  {selectedVehicle.status === "Maintenance Warning" ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  )}
                  <span>Status: {selectedVehicle.status}</span>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-cyan-400" /> Speed
                    </span>
                    <span className="font-display text-base font-bold text-slate-100 mt-0.5 block">
                      {selectedVehicle.speed} <span className="text-xs font-normal text-slate-400">km/h</span>
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Fuel className="h-3 w-3 text-amber-400" /> Fuel Level
                    </span>
                    <span className="font-display text-base font-bold text-slate-100 mt-0.5 block">
                      {selectedVehicle.fuel}%
                    </span>
                  </div>
                </div>

                {/* Payload Capacity Bar */}
                {selectedVehicle.maxPayload > 0 && (
                  <div className="space-y-1 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Payload Fill:</span>
                      <span className="font-bold text-cyan-300">
                        {selectedVehicle.payload} / {selectedVehicle.maxPayload} Tons ({Math.round((selectedVehicle.payload / selectedVehicle.maxPayload) * 100)}%)
                      </span>
                    </div>
                    <Progress value={(selectedVehicle.payload / selectedVehicle.maxPayload) * 100} className="h-2 bg-slate-800" />
                  </div>
                )}

                {/* Diagnostics List */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Engine Temperature:</span>
                    <span className={cn("font-mono font-bold", selectedVehicle.temp > 90 ? "text-red-400" : "text-emerald-400")}>
                      {selectedVehicle.temp}°C
                    </span>
                  </div>
                  {selectedVehicle.tirePressure > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Avg Tire Pressure:</span>
                      <span className="font-mono font-bold text-cyan-300">{selectedVehicle.tirePressure} PSI</span>
                    </div>
                  )}
                </div>

                <Button className="w-full h-8 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs mt-2">
                  <Navigation className="h-3.5 w-3.5 mr-1" /> Re-assign Haul Route
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
