import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const nitroConfig = process.env.VERCEL ? { preset: "vercel" as const } : {};

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    // Force these packages to be bundled (inlined) into the server output
    // instead of being left as bare external imports. Without this, Nitro's
    // rollup build can emit `import "tslib"` in the generated server chunks
    // (e.g. from @supabase/functions-js), which then fails to resolve at
    // runtime on Vercel with ERR_MODULE_NOT_FOUND because `tslib` isn't
    // copied into the deployed serverless function's node_modules.
    noExternal: ["tslib"],
  },
  plugins: [
    tanstackStart(),
    nitro(nitroConfig),
    react(),
    tailwindcss(),
  ],
  build: {
    sourcemap: false,
  },
});

