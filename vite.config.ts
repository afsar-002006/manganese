// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// On Netlify (NETLIFY=true in their CI) build with the Netlify nitro preset.
// Everywhere else (Lovable preview/publish) keep the default Cloudflare target.
const isNetlify = process.env["NETLIFY"] === "true" || process.env["NITRO_PRESET"] === "netlify";

export default defineConfig({
  ...(isNetlify ? { nitro: { preset: "netlify" } } : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
