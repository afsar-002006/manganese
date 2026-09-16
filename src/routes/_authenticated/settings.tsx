import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMine } from "@/context/MineContext";
import { PageHeader, Panel } from "@/components/app/PageHeader";
import { DemoDisclaimer } from "@/components/app/DemoBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Manganese Intelligence" },
      {
        name: "description",
        content: "Account details, default mine selection and platform scope information.",
      },
      { property: "og:title", content: "Settings — Manganese Intelligence" },
      { property: "og:description", content: "Manage your account and default mine." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { mines, mineId, setMineId } = useMine();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (localStorage.getItem("demo_mode") === "true") {
      setEmail("demo@manganese-intelligence.com");
      return;
    }
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const roles = useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      if (localStorage.getItem("demo_mode") === "true") {
        return ["geologist", "operator", "admin"];
      }
      const { data, error } = await supabase.from("user_roles").select("role");
      if (error) throw new Error(error.message);
      return (data ?? []).map((r) => r.role as string);
    },
  });

  async function signOut() {
    localStorage.removeItem("demo_mode");
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Account, default mine and platform scope." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Account">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{email || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Roles</dt>
              <dd className="font-medium capitalize">
                {(roles.data ?? []).join(", ") || "viewer"}
              </dd>
            </div>
          </dl>
          <Button variant="outline" className="mt-5 gap-2" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </Panel>

        <Panel title="Default mine">
          <div className="space-y-2">
            <Label>Selected mine</Label>
            <Select {...(mineId ? { value: mineId } : {})} onValueChange={(v) => setMineId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a mine" />
              </SelectTrigger>
              <SelectContent>
                {mines.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} — {m.district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Your choice is remembered on this device and applies across every page.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Scientific scope">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • Map scores express <strong className="text-foreground">prospectivity</strong> — modelled
            favourability for further exploration. They are not a detection of manganese and not a
            statement of reserves or resources.
          </li>
          <li>
            • Analytics and services are behind a modular interface so the underlying engines can later
            be replaced by dedicated geoscience processing without changing the interface.
          </li>
          <li>• Coordinates shown are approximate and are not survey grade.</li>
        </ul>
      </Panel>

      <Panel>
        <DemoDisclaimer />
      </Panel>
    </div>
  );
}
