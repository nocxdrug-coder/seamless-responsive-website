import type { Config } from "@react-router/dev/config";

export default {
  // Full SPA mode - no SSR
  ssr: false,
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
