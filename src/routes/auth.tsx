import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mountain, Loader2, Sparkles, UserCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DemoDisclaimer } from "@/components/app/DemoBadge";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Manganese Intelligence" },
      {
        name: "description",
        content:
          "Sign in to the Manganese Intelligence console for prospectivity mapping, production forecasting and operations analytics.",
      },
      { property: "og:title", content: "Sign in — Manganese Intelligence" },
      {
        property: "og:description",
        content: "Secure access to the manganese exploration and production intelligence console.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  fullName: z.string().trim().max(80).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("demo_mode") === "true") {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  function handleDemoAccess() {
    localStorage.setItem("demo_mode", "true");
    toast.success("Welcome to Manganese Intelligence Console (Demo Mode)");
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        localStorage.removeItem("demo_mode");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        localStorage.removeItem("demo_mode");
        if (!data.session) {
          setSentConfirmation(true);
          toast.success("Check your inbox to confirm your email address.");
        } else {
          toast.success("Account created successfully!");
          navigate({ to: "/dashboard", replace: true });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      if (msg.toLowerCase().includes("invalid login credentials")) {
        toast.error("Invalid email or password. If you haven't created an account yet, switch to 'Create Account' tab or click 'Explore Demo Console'.");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    localStorage.removeItem("demo_mode");
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Mountain className="h-6 w-6" />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-tight">MANGANESE</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Intelligence
            </p>
          </div>
        </Link>

        <div className="panel glow-ring p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
            <div className="flex gap-2 p-1 bg-muted/40 rounded-lg w-full">
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  mode === "signin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  setMode("signin");
                  setSentConfirmation(false);
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  mode === "signup"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  setMode("signup");
                  setSentConfirmation(false);
                }}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Quick Demo Access banner */}
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 p-3.5 text-center">
            <p className="text-xs font-medium text-foreground mb-2">
              Want instant access to test all console features?
            </p>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="w-full font-semibold shadow-md gap-2"
              onClick={handleDemoAccess}
            >
              <Sparkles className="h-4 w-4 text-primary-foreground" />
              Explore Demo Console (Instant Access)
            </Button>
          </div>

          <h1 className="font-display text-xl font-bold">
            {mode === "signin" ? "Sign in to the console" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Enter your credentials to access prospectivity mapping and operations."
              : "Register your email to manage manganese exploration datasets."}
          </p>

          {sentConfirmation ? (
            <div className="mt-6 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
              We sent a confirmation link to <strong>{email}</strong>. Open it to activate your
              account, then sign in.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="A. Sharma"
                    maxLength={80}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
          )}

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
            Continue with Google
          </Button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "No account yet?" : "Already registered?"}{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setSentConfirmation(false);
              }}
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>

        <div className="mt-6 panel p-4">
          <DemoDisclaimer />
        </div>
      </div>
    </div>
  );
}

