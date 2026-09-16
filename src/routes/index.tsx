import { createFileRoute, Link } from "@tanstack/react-router";
import { BrainCircuit, Compass, Factory, Mountain, Satellite, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoDisclaimer } from "@/components/app/DemoBadge";
import { SihVideoShowcase } from "@/components/app/SihVideoShowcase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Manganese Intelligence — Prospectivity & Production Console" },
      {
        name: "description",
        content:
          "AI and space technology for manganese prospectivity mapping, production forecasting, equipment analytics and operational recommendations.",
      },
      { property: "og:title", content: "Manganese Intelligence — Prospectivity & Production Console" },
      {
        property: "og:description",
        content:
          "Prospectivity mapping, production forecasting and explainable operational recommendations in one mining command centre.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: Compass,
    title: "Explore smarter",
    body: "Rank ground by modelled prospectivity so drilling effort goes where favourability is highest.",
  },
  {
    icon: BrainCircuit,
    title: "Predict better",
    body: "Forecast monthly output, attribute the shortfall to its drivers, and test scenarios before committing.",
  },
  {
    icon: Factory,
    title: "Mine efficiently",
    body: "Track equipment availability, weather exposure and blast sequencing in one operations view.",
  },
  {
    icon: ShieldCheck,
    title: "Build responsibly",
    body: "Every figure is versioned, audited and clearly labelled — with prospectivity never presented as reserves.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Mountain className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-bold leading-tight">MANGANESE</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Intelligence
            </p>
          </div>
        </div>
        <Button asChild size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-accent">
          <Satellite className="h-3.5 w-3.5" /> AI + Space technology
        </span>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.08] md:text-6xl">
          Smart mining for a stronger tomorrow.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          A single command centre for manganese exploration and production intelligence —
          prospectivity mapping, forecast attribution, equipment and weather analytics, and
          explainable recommendations your planners can act on.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/auth">Open the console</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth">Create an account</Link>
          </Button>
        </div>

        {/* SIH Video & Visual Presentation Showcase */}
        <div className="mt-12">
          <SihVideoShowcase />
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="panel p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <p.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-base font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="panel mt-10 p-5">
          <DemoDisclaimer />
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Powered by AI · Enabled by space data · For a sustainable tomorrow
      </footer>
    </div>
  );
}
