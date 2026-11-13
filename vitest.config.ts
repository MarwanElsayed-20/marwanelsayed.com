import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    // Keep test progress visible in non-interactive Windows terminals.
    reporters: ["verbose"],
    // Separate processes avoid stalled thread workers on Windows and preserve test isolation.
    pool: "forks",
    maxWorkers: 1,
    fileParallelism: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
