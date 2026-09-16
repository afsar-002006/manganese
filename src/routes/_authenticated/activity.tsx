import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { miningService } from "@/services/mining-service";
import { EmptyState, PageHeader, Panel } from "@/components/app/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({
    meta: [
      { title: "Activity Log — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Audit trail of recommendation runs, scenario simulations, uploads and report generation.",
      },
      { property: "og:title", content: "Activity Log — Manganese Intelligence" },
      { property: "og:description", content: "Traceable record of every action in the platform." },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const entries = useQuery({
    queryKey: ["audit"],
    queryFn: () => miningService.listAuditEntries(),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity Log"
        subtitle="Every model run, upload and report is recorded for traceability and review."
      />

      <Panel>
        {(entries.data ?? []).length === 0 ? (
          <EmptyState message="No recorded activity yet." />
        ) : (
          <div className="overflow-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.data!.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(e.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{e.action.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-muted-foreground">{e.entity}</TableCell>
                    <TableCell className="max-w-md truncate text-xs text-muted-foreground">
                      {Object.entries(e.metadata ?? {})
                        .map(([k, v]) => `${k}: ${String(v)}`)
                        .join(" · ") || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
    </div>
  );
}
