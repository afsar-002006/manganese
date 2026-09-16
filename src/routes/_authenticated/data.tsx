import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Loader2, RefreshCw, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useMine } from "@/context/MineContext";
import { miningService } from "@/services/mining-service";
import { getPipelineHealth, registerUpload } from "@/lib/mining.functions";
import { supabase } from "@/integrations/supabase/client";
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
import { bytes } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/data")({
  head: () => ({
    meta: [
      { title: "Data Management — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Upload and validate borehole, production, equipment, weather and geospatial datasets with quality scoring.",
      },
      { property: "og:title", content: "Data Management — Manganese Intelligence" },
      {
        property: "og:description",
        content: "Secure dataset uploads with automated validation and pipeline health.",
      },
    ],
  }),
  component: DataPage,
});

const DATASET_TYPES = [
  { value: "borehole", label: "Borehole logs" },
  { value: "production", label: "Production records" },
  { value: "equipment", label: "Equipment registry" },
  { value: "weather", label: "Weather observations" },
  { value: "geospatial", label: "Geospatial layer" },
  { value: "other", label: "Other" },
] as const;

type DatasetType = (typeof DATASET_TYPES)[number]["value"];

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXT = ["csv", "txt", "json", "geojson", "xlsx"];

const STATUS_STYLE: Record<string, string> = {
  passed: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  failed: "bg-destructive/15 text-destructive",
  healthy: "bg-success/15 text-success",
  partial: "bg-warning/15 text-warning",
  missing: "bg-destructive/15 text-destructive",
};

function DataPage() {
  const { mineId } = useMine();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [datasetType, setDatasetType] = useState<DatasetType>("borehole");
  const [busy, setBusy] = useState(false);

  const register = useServerFn(registerUpload);
  const pipeline = useServerFn(getPipelineHealth);

  const uploads = useQuery({ queryKey: ["uploads"], queryFn: () => miningService.listUploads() });

  const health = useQuery({
    queryKey: ["pipeline", mineId],
    queryFn: () => pipeline({ data: { mineId: mineId! } }),
    enabled: !!mineId,
  });

  const refreshHealth = useMutation({
    mutationFn: async () => qc.invalidateQueries({ queryKey: ["pipeline", mineId] }),
    onSuccess: () => toast.success("Pipeline health refreshed"),
  });

  async function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.includes(ext)) {
      toast.error(`Unsupported file type. Allowed: ${ALLOWED_EXT.join(", ")}`);
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File exceeds the 25 MB limit.");
      return;
    }

    setBusy(true);
    try {
      const isDemo = localStorage.getItem("demo_mode") === "true";
      const { data: userData } = isDemo
        ? { data: { user: { id: "demo-user" } } }
        : await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) throw new Error("Not signed in");

      const path = `${uid}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const up = await supabase.storage.from("mining-datasets").upload(path, file, {
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });
      if (up.error) throw new Error(up.error.message);

      let headerLine: string | undefined;
      let rowCount: number | undefined;
      if (["csv", "txt"].includes(ext)) {
        const text = await file.slice(0, 200_000).text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        headerLine = lines[0]?.slice(0, 2000);
        rowCount = Math.max(lines.length - 1, 0);
      }

      const result = await register({
        data: {
          mineId: mineId ?? null,
          datasetType,
          fileName: file.name.slice(0, 200),
          storagePath: path,
          fileSizeBytes: file.size,
          mimeType: file.type || "application/octet-stream",
          ...(headerLine !== undefined && { headerLine }),
          ...(rowCount !== undefined && { rowCount }),
        },
      });

      void qc.invalidateQueries({ queryKey: ["uploads"] });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      if (result.status === "failed") toast.error(`Validation failed — quality ${result.quality}/100`);
      else if (result.status === "warning")
        toast.warning(`Uploaded with warnings — quality ${result.quality}/100`);
      else toast.success(`Uploaded and validated — quality ${result.quality}/100`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Data Management"
        subtitle="Upload datasets to secure private storage. Every file is validated against the expected schema and scored for quality."
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Upload dataset" className="xl:col-span-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dataset type</Label>
              <Select value={datasetType} onValueChange={(v) => setDatasetType(v as DatasetType)}>
                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATASET_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) void handleFile(f);
              }}
            >
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Drop a file here or choose one</p>
              <p className="mt-1 text-xs text-muted-foreground">
                CSV, TXT, JSON, GeoJSON or XLSX · maximum 25 MB
              </p>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".csv,.txt,.json,.geojson,.xlsx"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
              <Button
                className="mt-4 gap-2"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                Select file
              </Button>
            </div>
          </div>
        </Panel>

        <Panel
          title="Pipeline health"
          right={
            <Button
              size="sm"
              variant="ghost"
              className="gap-1"
              disabled={!mineId || refreshHealth.isPending}
              onClick={() => refreshHealth.mutate()}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          }
        >
          {!health.data ? (
            <EmptyState message="Select a mine to check dataset completeness." />
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Overall completeness</p>
                <p className="font-display text-2xl font-bold text-primary">
                  {health.data.overall_pct}%
                </p>
              </div>
              <ul className="space-y-2">
                {health.data.sets.map((s) => (
                  <li key={s.name} className="rounded-lg border border-border bg-muted/25 p-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span>{s.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          STATUS_STYLE[s.status] ?? "bg-muted"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${s.completeness_pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {s.rows} of {s.expected} expected rows
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Upload history">
        {(uploads.data ?? []).length === 0 ? (
          <EmptyState message="No uploads yet." />
        ) : (
          <ul className="space-y-2">
            {uploads.data!.map((u) => (
              <li key={u.id} className="rounded-lg border border-border bg-muted/25 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{u.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.dataset_type} · {bytes(u.file_size_bytes)} ·{" "}
                      {u.row_count != null ? `${u.row_count} rows · ` : ""}
                      {new Date(u.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.quality_score != null && (
                      <span className="text-xs text-muted-foreground">
                        Quality {u.quality_score}/100
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                        STATUS_STYLE[u.validation_status] ?? "bg-muted"
                      }`}
                    >
                      {u.validation_status}
                    </span>
                  </div>
                </div>
                {(u.issues ?? []).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {u.issues.map((i, idx) => (
                      <li key={idx} className="text-xs text-warning">
                        • {i}
                      </li>
                    ))}
                  </ul>
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
