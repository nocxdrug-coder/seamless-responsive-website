import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  // Full SPA mode - no SSR
  ssr: false,
  presets: [vercelPreset()],
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
