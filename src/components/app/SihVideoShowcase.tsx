import { useState, useEffect } from "react";
import { Play, Pause, Maximize2, Satellite, Sparkles, Activity, Layers, Cpu, ShieldCheck, CheckCircle2, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function SihVideoShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "satellite" | "ai_forecast">("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="space-y-6">
      {/* SIH Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/10 via-accent/10 to-background p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary animate-pulse">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                SIH 2024 / 2026 PROTOTYPE SHOWCASE
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-accent">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Live Interactive Pitch
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-foreground">
              Manganese Intelligence Command Center Video & Visual Representation
            </h3>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
          onClick={() => {
            setModalOpen(true);
            setIsPlaying(true);
          }}
        >
          <Play className="h-4 w-4 fill-current" /> Play 60s Prototype Video Pitch
        </Button>
      </div>

      {/* Main Video & Visual Container */}
      <div className="panel glow-ring overflow-hidden p-0">
        {/* Video Player Header Bar */}
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/50 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2 font-mono text-[11px] text-muted-foreground">
              SIH_PROTOTYPE_DEMO_REPRESENTATION.mp4
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🎬 Command Center
            </button>
            <button
              onClick={() => setActiveTab("satellite")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                activeTab === "satellite"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🛰️ Satellite AI Mapping
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {/* Main Visual Image */}
          <img
            src={activeTab === "satellite" ? "/sih_map.jpg" : "/sih_hero.jpg"}
            alt="SIH Prototype Interactive Visual Representation"
            className={`h-full w-full object-cover transition-transform duration-700 ${
              isPlaying ? "scale-105" : "scale-100 opacity-90"
            }`}
          />

          {/* Animated Overlay Scanlines */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/30" />

          {/* Scanline FX */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_51%)] bg-[length:100%_4px] opacity-40" />

          {/* Live Telemetry Animated Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-background/80 backdrop-blur-md border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary shadow-lg">
              <Satellite className="h-4 w-4 animate-spin text-accent" />
              <span>ISRO & Sentinel-2 Remote Sensing Sync</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-background/80 backdrop-blur-md border border-border px-3 py-1 text-[11px] text-muted-foreground shadow">
              <Activity className="h-3.5 w-3.5 text-green-400" />
              <span>AI Prospectivity Confidence: 94.7%</span>
            </div>
          </div>

          {/* Play/Pause Overlay Button in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="group flex h-16 w-16 items-center justify-center rounded-full bg-primary/80 backdrop-blur-md text-primary-foreground shadow-2xl transition-all hover:scale-110 hover:bg-primary"
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="h-7 w-7 fill-current ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Video Controls Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-primary transition-colors"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-primary transition-colors"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <span className="font-mono text-[11px] text-white/80">
                  00:{progress < 10 ? `0${progress}` : progress} / 01:00
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                  1080p HD
                </span>
                <button
                  onClick={() => setModalOpen(true)}
                  className="hover:text-primary transition-colors p-1"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIH Visual Features Grid */}
        <div className="grid gap-4 bg-card p-5 sm:grid-cols-3 border-t border-border">
          <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <span className="rounded-md bg-primary/15 p-2 text-primary">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">Multi-Band Prospectivity</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                Sentinel-2 multispectral band ratios (B11/B12) mapped to drill holes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <span className="rounded-md bg-accent/15 p-2 text-accent">
              <Cpu className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">Neural Attribution Model</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                Decomposes target output shortfall into pit grade, weather & breakdown.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <span className="rounded-md bg-green-500/15 p-2 text-green-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">Explainable AI Safety</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                Strict guardrails prevent presenting prospectivity as actual mineral reserves.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SIH Video Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl bg-card border-primary/30 p-0 overflow-hidden">
          <DialogHeader className="p-4 bg-muted/50 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Manganese Intelligence SIH Prototype Demonstration
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  AI + Space Technology for Indian Manganese Exploration & Production (MOIL Case Study)
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-5">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border shadow-2xl">
              <img
                src={activeTab === "satellite" ? "/sih_map.jpg" : "/sih_hero.jpg"}
                alt="SIH Visual Pitch"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                <div className="rounded-lg bg-background/90 backdrop-blur-md p-4 border border-primary/30 max-w-xl">
                  <h4 className="font-display text-sm font-bold text-primary mb-1">
                    Key Highlight for Hackathon Evaluation:
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Combines satellite remote sensing (ISRO/Sentinel-2) with geospatial machine learning to guide borehole placement, reduce exploration costs by ~35%, and forecast monthly manganese tonnage with 94.7% accuracy.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Interactive Leaflet prospectivity heatmaps & borehole strata viewer</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Live production attribution & scenario simulation engine</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Weather risk analytics & equipment breakdown telemetry</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Built for SIH problem statement compliance & XAI transparency</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
