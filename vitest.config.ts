import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

// Load environment variables for tests
dotenv.config();

export default defineConfig({
  test: {
    environment: "node",
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/e2e/**",
      "**/.next/**"
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "lib/services/auth.service.ts",
        "lib/services/internship.service.ts",
        "lib/services/application.service.ts",
        "lib/services/ai-insights.service.ts",
        "lib/services/career-advisor.service.ts",
        "lib/services/matching.service.ts",
      ],
    },
    hookTimeout: 30000,
    testTimeout: 30000,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
  },
});
