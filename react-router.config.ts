import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // SSR disabled — running in SPA mode. Prerender removed (incompatible with API route exports in ssr:false mode).
  ssr: false,
  presets: [vercelPreset()],
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
