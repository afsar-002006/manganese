import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  BrainCircuit,
  CloudRain,
  Database,
  FileBarChart,
  Gauge,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Mountain,
  Settings,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { miningService } from "@/services/mining-service";
import { useMine } from "@/context/MineContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DemoBadge } from "./DemoBadge";

const NAV = [
  { group: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Exploration",
    items: [
      { to: "/prospectivity", label: "Prospectivity Map", icon: Map },
      { to: "/boreholes", label: "Borehole Data", icon: Mountain },
    ],
  },
  {
    group: "Production",
    items: [
      { to: "/production", label: "Production Forecast", icon: Gauge },
      { to: "/equipment", label: "Equipment Analytics", icon: Truck },
      { to: "/weather", label: "Weather Analysis", icon: CloudRain },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { to: "/insights", label: "AI Insights", icon: BrainCircuit },
      { to: "/simulator", label: "Scenario Simulator", icon: SlidersHorizontal },
    ],
  },
  {
    group: "Operations",
    items: [
      { to: "/data", label: "Data & Quality", icon: Database },
      { to: "/reports", label: "Reports", icon: FileBarChart },
      { to: "/activity", label: "Activity Log", icon: Activity },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { mines, mineId, setMineId } = useMine();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => miningService.listNotifications(),
    refetchInterval: 60_000,
  });
  const unread = notifications.filter((n) => !n.read_at).length;

  async function signOut() {
    localStorage.removeItem("demo_mode");
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Mountain className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-tight">MANGANESE</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Intelligence
            </p>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((section) => (
            <div key={section.group} className="mb-5">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {section.group}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-sidebar-primary/20 font-semibold text-sidebar-primary-foreground ring-1 ring-sidebar-primary/40"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <item.icon
                          className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="font-display text-xs font-semibold tracking-[0.28em] text-muted-foreground">
            MANGANESE
          </p>
          <p className="text-[10px] tracking-[0.1em] text-muted-foreground/70">FUELS PROGRESS</p>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground/70">
            Exploration intelligence for a stronger tomorrow.
          </p>
        </div>
      </aside>

      {open && (
        <button
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          <Select value={mineId ?? ""} onValueChange={setMineId}>
            <SelectTrigger className="h-9 w-[210px] bg-card">
              <SelectValue placeholder="Select mine" />
            </SelectTrigger>
            <SelectContent>
              {mines.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DemoBadge className="hidden sm:inline-flex" />

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
