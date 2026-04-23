import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Keep SSR enabled because many route modules export server loaders/actions.
  ssr: true,
  presets: [vercelPreset()],
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
