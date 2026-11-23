import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Standalone from vite.config.ts: unit tests don't need the TanStack Start / Nitro plugins.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
