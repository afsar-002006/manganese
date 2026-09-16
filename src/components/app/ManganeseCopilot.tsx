import { useState, useRef, useEffect } from "react";
import {
  BrainCircuit,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Zap,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMine } from "@/context/MineContext";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  metrics?: { label: string; value: string; trend?: string }[];
  recommendation?: string;
}

const QUICK_PROMPTS = [
  "🎯 Best drill targets in Sector 4",
  "📊 Calculate Mn recovery yield at 42% grade",
  "🌿 Evaluate Tailings Dam & ESG risk",
  "🚜 HT-102 Haul Truck efficiency status",
  "⚡ High-grade ore seam depth profile",
];

const PRESET_RESPONSES: Record<string, { text: string; metrics?: Message["metrics"]; recommendation?: string }> = {
  "🎯 Best drill targets in Sector 4": {
    text: "Based on gravity anomaly heatmaps, magnetic field gradient data (+340 nT), and historical assays from Borehole BH-104:\n\n• **Primary Target site**: Sector 4-B (Lat -22.415, Long 118.524)\n• **Estimated Depth**: 145m - 180m below surface\n• **Target Horizon**: High-grade braunite/pyrolusite manganese seam\n• **Estimated Grade**: 38.5% - 44.2% Mn",
    metrics: [
      { label: "Est. Mn Grade", value: "41.8%", trend: "+3.2%" },
      { label: "Confidence", value: "94.2%", trend: "High" },
      { label: "Est. Tonnage", value: "280,000 T", trend: "High Yield" },
    ],
    recommendation: "Deploy Diamond Core Rig DR-02 for a 200m inclination borehole at 75° angle.",
  },
  "📊 Calculate Mn recovery yield at 42% grade": {
    text: "Manganese beneficiation calculations for **42% Mn feed grade**:\n\n• **Heavy Media Separation (HMS) Yield**: 84.5% recovery rate\n• **Dense Medium Cyclone Efficiency**: High density cut at 3.2 g/cm³\n• **Concentrate Grade**: 48.6% Mn (Premium Metallurgical Grade)\n• **Tailings Loss**: 15.5% low-grade silica/iron rejection",
    metrics: [
      { label: "Feed Grade", value: "42.0% Mn" },
      { label: "Recovery Rate", value: "84.5%", trend: "Optimal" },
      { label: "Est. Revenue/Ton", value: "$210/T", trend: "+12%" },
    ],
    recommendation: "Feed stockpiles directly to Primary HMS Beneficiation Plant Circuit 2.",
  },
  "🌿 Evaluate Tailings Dam & ESG risk": {
    text: "ESG & Geological Hazard Assessment:\n\n• **Tailings Dam Piezometer Pressure**: 142 kPa (Normal range < 180 kPa)\n• **Slope Stability Index**: 1.74 FOS (Factor of Safety > 1.5)\n• **Groundwater pH**: 7.2 (Neutral, Zero Heavy Metal Seepage)\n• **Dust PM10**: 34 µg/m³ (Well below regulatory limit of 50 µg/m³)",
    metrics: [
      { label: "Dam Safety Index", value: "1.74 FOS", trend: "Safe" },
      { label: "Dust Index", value: "34 µg/m³", trend: "Good" },
      { label: "Carbon/Ton", value: "18.4 kg CO2", trend: "-8%" },
    ],
    recommendation: "Maintain routine daily slope radar sweeps. All ESG compliance indicators green.",
  },
  "🚜 HT-102 Haul Truck efficiency status": {
    text: "Fleet Telemetry Diagnostics for **Haul Truck HT-102**:\n\n• **Engine Status**: Operational (78°C coolant, 4.2 bar oil pressure)\n• **Payload Capacity**: 92.4 Tons (97% rated capacity)\n• **Fuel Burn Rate**: 42 L/hr (5.2% more efficient than fleet avg)\n• **Next Maintenance Service**: 142 operating hours remaining",
    metrics: [
      { label: "Current Speed", value: "28 km/h" },
      { label: "Payload", value: "92.4 T", trend: "97%" },
      { label: "Efficiency", value: "94.8%", trend: "+2.1%" },
    ],
    recommendation: "Schedule routine tire rotation during shift change at 18:00.",
  },
  "⚡ High-grade ore seam depth profile": {
    text: "Geological Stratigraphy Profile:\n\n1. **Overburden (0 - 45m)**: Weathered ferruginous cap & silica soil.\n2. **Upper Low-Grade Seam (45m - 90m)**: Cryptomelane & iron shale (21-28% Mn).\n3. **Main Braunitic Horizon (90m - 180m)**: High-density manganese oxide horizon (38-46% Mn).\n4. **Basal Sandstone Footwall (> 180m)**: Barren basement rock.",
    metrics: [
      { label: "Main Seam Thickness", value: "90 Meters" },
      { label: "Dip Angle", value: "14° SE" },
      { label: "Strip Ratio", value: "2.1 : 1" },
    ],
    recommendation: "Target bench excavation level 3 at -110m elevation for maximum grade yield.",
  },
};

export function ManganeseCopilot() {
  const { mines, mineId } = useMine();
  const currentMine = mines.find((m) => m.id === mineId);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: `Hello! I'm **Manganese AI Copilot**, your real-time exploration & mine intelligence assistant. Synchronized with **${
        currentMine?.name ?? "Manganese Operations"
      }**.\n\nHow can I assist your geological or operational team today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function handleSend(textToSend?: string) {
    const messageText = (textToSend || input).trim();
    if (!messageText) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let responseObj = PRESET_RESPONSES[messageText];

      if (!responseObj) {
        responseObj = {
          text: `Analyzing query regarding "${messageText}" for **${currentMine?.name ?? "Mine Site"}**...\n\nBased on spatial geophysics and active borehole data:\n\n• The geological formation displays strong structural continuity along the fault plane.\n• Magnetic susceptibility index confirms low silica contamination.\n• Recommended next action: cross-reference with geophysical survey maps on Sector 3.`,
          metrics: [
            { label: "Data Quality", value: "High (98%)" },
            { label: "Target Viability", value: "Promising", trend: "+4.5%" },
          ],
          recommendation: "Conduct infill drilling at 50m spacing to confirm orebody geometry.",
        };
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: responseObj.text,
        ...(responseObj.metrics ? { metrics: responseObj.metrics } : {}),
        ...(responseObj.recommendation ? { recommendation: responseObj.recommendation } : {}),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full px-4 py-3 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen
            ? "bg-slate-800 text-slate-200 ring-2 ring-slate-700"
            : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-indigo-500/25 ring-2 ring-violet-400/40 hover:shadow-indigo-500/40",
        )}
        aria-label="Toggle Manganese AI Copilot"
      >
        <div className="relative flex items-center justify-center">
          <BrainCircuit className="h-5 w-5 animate-pulse text-amber-300" />
          <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300" />
          </span>
        </div>
        <span className="text-sm font-bold tracking-wide">Manganese Copilot</span>
        {isOpen ? <ChevronDown className="h-4 w-4 ml-1 opacity-70" /> : <Sparkles className="h-4 w-4 ml-1 text-amber-300" />}
      </button>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 flex h-[620px] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-violet-500/30 bg-slate-950/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-violet-500/20 bg-gradient-to-r from-violet-950/80 via-slate-900 to-slate-950 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/30 text-violet-300 ring-1 ring-violet-400/40">
                <BrainCircuit className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-bold text-slate-100">Manganese AI Copilot</h3>
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-400">
                    Online
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  Site: <span className="font-medium text-violet-300">{currentMine?.name ?? "Manganese Mine"}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                onClick={() =>
                  setMessages([
                    {
                      id: "init",
                      sender: "ai",
                      text: `Conversation cleared. Ready for new exploration queries for **${
                        currentMine?.name ?? "Manganese Mine"
                      }**.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                  ])
                }
                title="Reset Chat"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800/60 bg-slate-900/60 px-3 py-2 text-xs no-scrollbar">
            <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="shrink-0 rounded-full border border-violet-500/20 bg-violet-950/40 px-2.5 py-1 text-[11px] font-medium text-violet-200 transition-all hover:border-violet-400/50 hover:bg-violet-900/60 active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-md",
                    msg.sender === "user"
                      ? "bg-slate-700 text-slate-200"
                      : "bg-gradient-to-br from-violet-600 to-indigo-700 text-amber-300 ring-1 ring-violet-400/40",
                  )}
                >
                  {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={cn(
                    "max-w-[85%] space-y-2 rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm",
                    msg.sender === "user"
                      ? "bg-violet-600 text-white rounded-tr-none"
                      : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none",
                  )}
                >
                  <div className="whitespace-pre-line">
                    {msg.text.split("\n").map((line, i) => {
                      if (line.startsWith("• ")) {
                        return (
                          <div key={i} className="my-1 flex items-start gap-1.5 pl-1">
                            <span className="text-violet-400">•</span>
                            <span>{parseBold(line.slice(2))}</span>
                          </div>
                        );
                      }
                      return <p key={i} className="my-0.5">{parseBold(line)}</p>;
                    })}
                  </div>

                  {/* Metrics Badges if AI response */}
                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-xl border border-violet-500/20 bg-slate-950/60 p-2">
                      {msg.metrics.map((m, idx) => (
                        <div key={idx} className="text-center">
                          <p className="text-[10px] text-slate-400">{m.label}</p>
                          <p className="font-display text-xs font-bold text-violet-300">{m.value}</p>
                          {m.trend && (
                            <span className="text-[9px] font-semibold text-emerald-400">
                              {m.trend}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendation banner */}
                  {msg.recommendation && (
                    <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-200">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">AI Recommendation: </span>
                        {msg.recommendation}
                      </div>
                    </div>
                  )}

                  <p
                    className={cn(
                      "text-[9px] text-right mt-1 opacity-60",
                      msg.sender === "user" ? "text-slate-200" : "text-slate-400",
                    )}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 text-amber-300 ring-1 ring-violet-400/40">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 rounded-tl-none">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 delay-150" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 delay-300" />
                  <span className="ml-2 text-[11px] text-slate-400 italic">Processing spatial & geological parameters...</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-800/80 bg-slate-950 p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot (e.g. grade, drill sites, ESG risk)..."
              className="h-9 border-slate-800 bg-slate-900 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="h-9 w-9 shrink-0 bg-violet-600 hover:bg-violet-500 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

// Helper to format bold markdown text like **bold**
function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
