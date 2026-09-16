import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMine } from "@/context/MineContext";
import { miningService } from "@/services/mining-service";
import { generateReport } from "@/lib/mining.functions";
import { EmptyState, PageHeader, Panel } from "@/components/app/PageHeader";
import { DemoDisclaimer } from "@/components/app/DemoBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Generate and download structured operations, exploration and shortfall reports built from live database records.",
      },
      { property: "og:title", content: "Reports — Manganese Intelligence" },
      {
        property: "og:description",
        content: "Structured reporting for mine operations and exploration.",
      },
    ],
  }),
  component: ReportsPage,
});

const REPORT_TYPES = [
  { value: "monthly_operations", label: "Monthly operations" },
  { value: "exploration_summary", label: "Exploration summary" },
  { value: "shortfall_analysis", label: "Shortfall analysis" },
] as const;

type ReportType = (typeof REPORT_TYPES)[number]["value"];

function ReportsPage() {
  const { mineId } = useMine();
  const qc = useQueryClient();
  const [reportType, setReportType] = useState<ReportType>("monthly_operations");
  const create = useServerFn(generateReport);

  const reports = useQuery({ queryKey: ["reports"], queryFn: () => miningService.listReports() });

  const mutation = useMutation({
    mutationFn: () => create({ data: { mineId: mineId!, reportType } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report generated");
    },
    onError: () => toast.error("Could not generate the report."),
  });

  function download(title: string, payload: unknown) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^\w]+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        subtitle="Every report is assembled from current database records for the selected mine — no static content."
      />

      <Panel title="Generate a report">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label>Report type</Label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger className="w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="gap-2"
            disabled={!mineId || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Generate
          </Button>
        </div>
      </Panel>

      <Panel title="Generated reports">
        {(reports.data ?? []).length === 0 ? (
          <EmptyState message="No reports generated yet." />
        ) : (
          <ul className="space-y-2">
            {reports.data!.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/25 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium capitalize">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.period_start} → {r.period_end} · generated{" "}
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => download(r.title, r.payload)}
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
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
