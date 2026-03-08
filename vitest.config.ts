import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      thresholds: {
        "src/domain/**": {
          statements: 100,
          branches: 85,
          functions: 100,
          lines: 100,
        },
        "src/cards/ha-gallery-card.ts": {
          statements: 60,
          lines: 60,
        },
      },
    },
  },
});
