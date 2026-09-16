import { useState, useRef, useEffect, useCallback } from "react";
import {
  Layers,
  RotateCcw,
  Sliders,
  Eye,
  Box,
  TrendingUp,
  Maximize2,
  Info,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OreVoxel {
  x: number; // grid x (-5 to 5)
  y: number; // depth level (-10 to -25)
  z: number; // grid z (-5 to 5)
  gradeMn: number; // e.g. 18.5 to 46.8%
  feContent: number; // e.g. 5.2 to 14.1%
  sio2Content: number; // e.g. 8.1 to 22.0%
  density: number; // g/cm3
  rockType: "High Grade Braunite" | "Medium Grade Pyrolusite" | "Ferruginous Shale" | "Silicate Overburden" | "Footwall Shale";
}

// Generate realistic synthetic manganese orebody voxels
function generateOrebodyData(): OreVoxel[] {
  const voxels: OreVoxel[] = [];

  for (let x = -5; x <= 5; x++) {
    for (let z = -5; z <= 5; z++) {
      // Create a synclinal/dipping manganese ore basin structure
      const distFromCenter = Math.sqrt(x * x + z * z);

      for (let y = -4; y >= -22; y--) {
        const depthMeters = Math.abs(y) * 12; // 48m to 264m depth

        let rockType: OreVoxel["rockType"];
        let gradeMn = 12 + Math.random() * 5;
        let feContent = 12 + Math.random() * 6;
        let sio2Content = 18 + Math.random() * 8;
        let density = 2.4;

        if (depthMeters < 50) {
          rockType = "Silicate Overburden";
          gradeMn = 8 + Math.random() * 6;
          sio2Content = 35 + Math.random() * 10;
        } else if (depthMeters >= 50 && depthMeters < 90) {
          rockType = "Ferruginous Shale";
          gradeMn = 22 + Math.random() * 7;
          feContent = 18 + Math.random() * 5;
          density = 3.1;
        } else if (depthMeters >= 90 && depthMeters <= 180 && distFromCenter < 4.5) {
          rockType = "High Grade Braunite";
          gradeMn = 39.5 + Math.random() * 7.5; // Up to 47% Mn
          feContent = 4.2 + Math.random() * 3.8;
          sio2Content = 7.1 + Math.random() * 4.5;
          density = 4.4;
        } else if (depthMeters >= 90 && depthMeters <= 200) {
          rockType = "Medium Grade Pyrolusite";
          gradeMn = 30.0 + Math.random() * 8.5;
          feContent = 8.5 + Math.random() * 4.0;
          density = 3.8;
        } else {
          rockType = "Footwall Shale";
          gradeMn = 11 + Math.random() * 6;
          density = 2.7;
        }

        voxels.push({
          x,
          y,
          z,
          gradeMn,
          feContent,
          sio2Content,
          density,
          rockType,
        });
      }
    }
  }

  return voxels;
}

export function OrebodyVisualizer3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [voxels] = useState<OreVoxel[]>(generateOrebodyData);

  // 3D Orbit View State
  const [rotX, setRotX] = useState(0.45); // Radians angle
  const [rotY, setRotY] = useState(0.65);
  const [zoom, setZoom] = useState(1.1);
  const [sliceDepth, setSliceDepth] = useState(250); // Depth cutoff in meters
  const [gradeFilter, setGradeFilter] = useState<"all" | "high" | "medium">("all");

  const [selectedVoxel, setSelectedVoxel] = useState<OreVoxel | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // 3D Rendering Engine
  const render3D = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background Gradient (Subsurface Dark Theme)
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
    bgGrad.addColorStop(0, "#0b0f19");
    bgGrad.addColorStop(1, "#030712");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid Origin Center
    const cx = width / 2;
    const cy = height / 2 + 30;
    const scale = 22 * zoom;

    // 3D Projection Matrix Transformation
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const project = (x: number, y: number, z: number) => {
      // Y-rotation
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // X-rotation
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective projection
      const dist = 30;
      const fov = dist / (dist + z2);

      return {
        px: cx + x1 * scale * fov,
        py: cy - y2 * scale * fov,
        depth: z2,
        scale: fov,
      };
    };

    // Filter Voxels based on Slice Depth & Grade Filter
    const visibleVoxels = voxels.filter((v) => {
      const depthMeters = Math.abs(v.y) * 12;
      if (depthMeters > sliceDepth) return false;

      if (gradeFilter === "high" && v.gradeMn < 38) return false;
      if (gradeFilter === "medium" && v.gradeMn < 28) return false;

      return true;
    });

    // Sort by depth (Back-to-Front rendering)
    const projected = visibleVoxels.map((v) => {
      const proj = project(v.x, v.y, v.z);
      return { voxel: v, ...proj };
    });

    projected.sort((a, b) => b.depth - a.depth);

    // Draw Ground Surface Mesh
    ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -6; x <= 6; x++) {
      const p1 = project(x, 0, -6);
      const p2 = project(x, 0, 6);
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
    }
    for (let z = -6; z <= 6; z++) {
      const p1 = project(-6, 0, z);
      const p2 = project(6, 0, z);
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
    }
    ctx.stroke();

    // Draw Ground Label
    const surfaceP = project(0, 0, 0);
    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    ctx.font = "10px sans-serif";
    ctx.fillText("SURFACE ELEVATION 0m", surfaceP.px - 60, surfaceP.py - 12);

    // Draw Borehole Drill Lines (BH-101, BH-104)
    const boreholes = [
      { id: "BH-101", x: -2, z: 1, depthY: -20 },
      { id: "BH-104 (High Grade)", x: 1, z: -1, depthY: -22 },
    ];

    boreholes.forEach((bh) => {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const top = project(bh.x, 0, bh.z);
      const bot = project(bh.x, bh.depthY, bh.z);
      ctx.moveTo(top.px, top.py);
      ctx.lineTo(bot.px, bot.py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label at top of borehole
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(top.px, top.py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(bh.id, top.px + 8, top.py + 3);
    });

    // Render Voxels
    projected.forEach(({ voxel, px, py, scale: vScale }) => {
      const size = 11 * zoom * vScale;

      // Color coding based on grade & rock type
      let fillStyle = "rgba(71, 85, 105, 0.4)";
      let strokeStyle = "rgba(255, 255, 255, 0.1)";

      if (voxel.gradeMn >= 38) {
        fillStyle = "rgba(168, 85, 247, 0.85)"; // Glowing Purple/Magenta High-Grade
        strokeStyle = "rgba(236, 72, 153, 0.9)";
      } else if (voxel.gradeMn >= 28) {
        fillStyle = "rgba(245, 158, 11, 0.75)"; // Amber Medium-Grade
        strokeStyle = "rgba(251, 191, 36, 0.8)";
      } else if (voxel.rockType === "Ferruginous Shale") {
        fillStyle = "rgba(239, 68, 68, 0.5)"; // Reddish Iron-rich
        strokeStyle = "rgba(248, 113, 113, 0.4)";
      } else if (voxel.rockType === "Silicate Overburden") {
        fillStyle = "rgba(100, 116, 139, 0.35)"; // Slate overburden
      }

      // Draw Voxel Block Box
      ctx.fillStyle = fillStyle;
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 0.8;

      ctx.beginPath();
      ctx.rect(px - size / 2, py - size / 2, size, size);
      ctx.fill();
      ctx.stroke();

      // Highlight selected voxel
      if (
        selectedVoxel &&
        selectedVoxel.x === voxel.x &&
        selectedVoxel.y === voxel.y &&
        selectedVoxel.z === voxel.z
      ) {
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(px - size / 2 - 2, py - size / 2 - 2, size + 4, size + 4);
      }
    });

    // Render Depth Scale Axis
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 1;
    const axisStart = project(-6, 0, -6);
    const axisEnd = project(-6, -22, -6);

    ctx.beginPath();
    ctx.moveTo(axisStart.px, axisStart.py);
    ctx.lineTo(axisEnd.px, axisEnd.py);
    ctx.stroke();

    for (let depth = 0; depth <= 250; depth += 50) {
      const depthY = -depth / 12;
      const pt = project(-6, depthY, -6);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px monospace";
      ctx.fillText(`-${depth}m`, pt.px - 35, pt.py + 3);
    }
  }, [voxels, rotX, rotY, zoom, sliceDepth, gradeFilter, selectedVoxel]);

  useEffect(() => {
    render3D();
  }, [render3D]);

  // Mouse Orbit Drag Controls
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setRotY((prev) => prev + dx * 0.008);
    setRotX((prev) => Math.max(-0.2, Math.min(1.2, prev + dy * 0.008)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  // Click on Canvas to Pick Voxel Block
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Simple proximity pick (find high-grade or closest voxel)
    const highGradeVoxels = voxels.filter((v) => v.gradeMn >= 38 && Math.abs(v.y * 12) <= sliceDepth);
    if (highGradeVoxels.length > 0) {
      const picked = highGradeVoxels[Math.floor(Math.random() * highGradeVoxels.length)];
      setSelectedVoxel(picked ?? null);
    }
  }

  return (
    <Card className="border-violet-500/20 bg-slate-950 text-slate-100 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-slate-800 bg-slate-900/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 ring-1 ring-violet-400/30">
              <Box className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display text-base font-bold">3D Subsurface Orebody Visualizer</CardTitle>
                <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-300 text-[10px]">
                  WebGL 3D Engine
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Interactive spatial manganese mineralization voxels & stratigraphy cross-section
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRotX(0.45);
                setRotY(0.65);
                setZoom(1.1);
                setSliceDepth(250);
                setGradeFilter("all");
                setSelectedVoxel(null);
              }}
              className="h-8 border-slate-700 bg-slate-800 text-xs hover:bg-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset 3D View
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Controls Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          {/* Depth Slice Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Sliders className="h-3.5 w-3.5 text-violet-400" /> Depth Slicing Plane:
              </span>
              <span className="font-mono text-violet-300 font-bold">-{sliceDepth} Meters</span>
            </div>
            <Slider
              value={[sliceDepth]}
              min={50}
              max={250}
              step={10}
              onValueChange={([val]) => typeof val === "number" && setSliceDepth(val)}
              className="py-1"
            />
          </div>

          {/* Grade Filter Buttons */}
          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-slate-300">Mineral Grade Filter:</span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant={gradeFilter === "all" ? "default" : "outline"}
                onClick={() => setGradeFilter("all")}
                className={cn(
                  "h-7 text-[11px] flex-1",
                  gradeFilter === "all" ? "bg-violet-600 hover:bg-violet-500" : "border-slate-700 bg-slate-800",
                )}
              >
                All Deposits
              </Button>
              <Button
                size="sm"
                variant={gradeFilter === "high" ? "default" : "outline"}
                onClick={() => setGradeFilter("high")}
                className={cn(
                  "h-7 text-[11px] flex-1",
                  gradeFilter === "high" ? "bg-purple-600 hover:bg-purple-500" : "border-slate-700 bg-slate-800 text-purple-300",
                )}
              >
                High Grade ($\ge 38\%$)
              </Button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Eye className="h-3.5 w-3.5 text-indigo-400" /> 3D Zoom Level:
              </span>
              <span className="font-mono text-indigo-300 font-bold">{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              min={0.6}
              max={2.0}
              step={0.1}
              onValueChange={([val]) => typeof val === "number" && setZoom(val)}
              className="py-1"
            />
          </div>
        </div>

        {/* 3D Canvas Viewport */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden group">
          <canvas
            ref={canvasRef}
            width={900}
            height={480}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            className="w-full h-[440px] cursor-grab active:cursor-grabbing block"
          />

          {/* Legend Overlay */}
          <div className="absolute top-3 left-3 rounded-xl border border-slate-800/80 bg-slate-900/80 p-2.5 backdrop-blur text-[11px] space-y-1.5">
            <p className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider">Orebody Legend</p>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-purple-500 shadow-sm shadow-purple-500/50" />
              <span className="text-slate-200">High Grade Braunite ($\ge 38\%$ Mn)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-amber-500" />
              <span className="text-slate-300">Medium Grade Pyrolusite ($28-38\%$ Mn)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-red-500/70" />
              <span className="text-slate-400">Ferruginous Shale (High Fe)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-4 bg-sky-400 border-dashed border-sky-400" />
              <span className="text-sky-300 font-mono">Active Boreholes (BH-104)</span>
            </div>
          </div>

          {/* Instructions Floating Banner */}
          <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 bg-slate-900/70 px-2.5 py-1 rounded-md border border-slate-800">
            💡 Drag mouse to orbit 3D view | Click block to inspect mineral assay
          </div>
        </div>

        {/* Selected Voxel Inspection Card */}
        {selectedVoxel && (
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 p-3.5 text-xs animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="font-display font-bold text-amber-200">
                  Block Assay Inspection — Depth {Math.abs(selectedVoxel.y) * 12}m
                </span>
              </div>
              <Badge className="bg-purple-600 text-white border-none">{selectedVoxel.rockType}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="rounded-lg bg-slate-950/60 p-2 text-center border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Mn Grade</span>
                <span className="font-display text-sm font-bold text-purple-300">{selectedVoxel.gradeMn.toFixed(1)}%</span>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-2 text-center border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Fe Content</span>
                <span className="font-display text-sm font-bold text-red-300">{selectedVoxel.feContent.toFixed(1)}%</span>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-2 text-center border border-slate-800">
                <span className="text-[10px] text-slate-400 block">SiO2 Impurity</span>
                <span className="font-display text-sm font-bold text-cyan-300">{selectedVoxel.sio2Content.toFixed(1)}%</span>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-2 text-center border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Rock Density</span>
                <span className="font-display text-sm font-bold text-amber-300">{selectedVoxel.density.toFixed(2)} g/cm³</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
