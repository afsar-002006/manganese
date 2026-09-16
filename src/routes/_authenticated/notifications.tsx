import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { miningService } from "@/services/mining-service";
import { markNotificationsRead } from "@/lib/mining.functions";
import { EmptyState, PageHeader, Panel } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Alerts for data-quality issues, refreshed recommendations and operational risk thresholds.",
      },
      { property: "og:title", content: "Notifications — Manganese Intelligence" },
      { property: "og:description", content: "Operational and data-quality alerts." },
    ],
  }),
  component: NotificationsPage,
});

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive",
  warning: "bg-warning/15 text-warning",
  info: "bg-primary/15 text-primary",
};

function NotificationsPage() {
  const qc = useQueryClient();
  const markRead = useServerFn(markNotificationsRead);

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => miningService.listNotifications(),
  });

  const unread = (notifications.data ?? []).filter((n) => !n.read_at);

  const mutation = useMutation({
    mutationFn: (ids: string[]) => markRead({ data: { ids } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Marked as read");
    },
    onError: () => toast.error("Could not update notifications."),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle="Alerts raised by uploads, the recommendation engine and risk thresholds."
        actions={
          <Button
            variant="outline"
            className="gap-2"
            disabled={unread.length === 0 || mutation.isPending}
            onClick={() => mutation.mutate(unread.slice(0, 200).map((n) => n.id))}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read ({unread.length})
          </Button>
        }
      />

      <Panel>
        {(notifications.data ?? []).length === 0 ? (
          <EmptyState message="No notifications yet." />
        ) : (
          <ul className="space-y-2">
            {notifications.data!.map((n) => (
              <li
                key={n.id}
                className={`rounded-lg border p-4 ${
                  n.read_at ? "border-border bg-muted/15" : "border-primary/40 bg-primary/5"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                        SEVERITY_STYLE[n.severity] ?? "bg-muted"
                      }`}
                    >
                      {n.severity}
                    </span>
                    {!n.read_at && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => mutation.mutate([n.id])}
                        disabled={mutation.isPending}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
