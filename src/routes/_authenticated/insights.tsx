import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMine } from "@/context/MineContext";
import { miningService } from "@/services/mining-service";
import { generateRecommendations } from "@/lib/mining.functions";
import { EmptyState, PageHeader, Panel } from "@/components/app/PageHeader";
import { DemoDisclaimer } from "@/components/app/DemoBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Deterministic, explainable recommendations ranked by expected impact, with the evidence behind each action.",
      },
      { property: "og:title", content: "AI Insights — Manganese Intelligence" },
      {
        property: "og:description",
        content: "Ranked operational actions with transparent reasoning.",
      },
    ],
  }),
  component: InsightsPage,
});

const IMPACT_STYLE: Record<string, string> = {
  High: "bg-primary/20 text-primary",
  Medium: "bg-warning/15 text-warning",
  Low: "bg-muted text-muted-foreground",
};

function InsightsPage() {
  const { mineId } = useMine();
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const generate = useServerFn(generateRecommendations);

  const recos = useQuery({
    queryKey: ["recommendations", mineId],
    queryFn: () => miningService.listRecommendations(mineId!),
    enabled: !!mineId,
  });

  const run = useMutation({
    mutationFn: () => generate({ data: { mineId: mineId! } }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ["recommendations", mineId] });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`${res.count} recommendations generated (${res.engine})`);
    },
    onError: () => toast.error("Could not generate recommendations. Please try again."),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Insights"
        subtitle="Rule-based, fully explainable recommendations. Every action lists the signals that triggered it."
        actions={
          <Button onClick={() => run.mutate()} disabled={!mineId || run.isPending} className="gap-2">
            {run.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate recommendations
          </Button>
        }
      />

      <Panel title="Ranked actions">
        {(recos.data ?? []).length === 0 ? (
          <EmptyState message="No recommendations yet. Run the engine to analyse current conditions." />
        ) : (
          <ul className="space-y-3">
            {recos.data!.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-muted/25 p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {r.rank}
                  </span>
                  <div className="min-w-[240px] flex-1">
                    <p className="font-semibold">{r.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{r.rationale}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                        IMPACT_STYLE[r.impact] ?? "bg-muted"
                      }`}
                    >
                      {r.impact} impact
                    </span>
                    <span className="rounded-full bg-card px-2.5 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                      {r.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  className="mt-3 text-xs font-medium text-primary hover:underline"
                >
                  {openId === r.id ? "Hide reasoning" : "Why this recommendation?"}
                </button>

                {openId === r.id && (
                  <div className="mt-3 rounded-lg border border-border bg-card/60 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Evidence
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {r.rationale.split(/;\s*/).filter(Boolean).map((e: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="text-primary">•</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[11px] text-muted-foreground">
                      Engine: {r.engine_version} · generated{" "}
                      {new Date(r.generated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <DemoDisclaimer />
      </Panel>
    </div>
  );
}
