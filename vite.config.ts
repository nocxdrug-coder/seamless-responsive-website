import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * React Router + Vercel preset owns SSR output; client builds to build/client with assets under /assets.
 * Keep base "/" so deployed asset URLs match Vercel static + function responses (avoid custom Output Directory in dashboard).
 */
export default defineConfig(async ({ mode }) => {
  const plugins: any[] = [reactRouter(), tsconfigPaths()];

  return {
    base: "/",
    server: {
      port: 5175,
    },
    build: {
      outDir: "build/client",
      assetsDir: "assets",
      emptyOutDir: true,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
    plugins,
  };
});
