import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/integrations/supabase/types.ts",
        "src/vite-env.d.ts",
        "src/main.tsx",
        "src/index.css",
        "src/components/ui/**",
      ],
      // Thresholds reflejan cobertura real medida con v8.
      // Branches están bien (68%) porque las lógicas críticas tienen tests.
      // Statements/functions bajos porque la mayoría de la UI no tiene unit tests.
      // Plan: subir 5% por sprint a medida que se agregan tests de integración.
      thresholds: {
        statements: 25,
        branches: 70,
        functions: 25,
        lines: 25,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
