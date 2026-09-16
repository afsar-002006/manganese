import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { MineProvider } from "@/context/MineContext";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined" && localStorage.getItem("demo_mode") === "true") {
      return {
        user: {
          id: "demo-user",
          email: "demo@manganese-intelligence.com",
          user_metadata: { full_name: "Demo Explorer" },
        },
      };
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <MineProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </MineProvider>
  );
}
