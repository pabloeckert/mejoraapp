import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Custom domain (app.mejoraok.com) en ambos: base = "/"
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    // Security headers for development server
    {
      name: "security-headers",
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("X-Frame-Options", "DENY");
          res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
          res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
          next();
        });
      },
    },
    // Bundle analysis — run with ANALYZE=true npm run build
    ...(process.env.ANALYZE
      ? [
          (() => {
            const { visualizer } = require("rollup-plugin-visualizer");
            return visualizer({
              filename: "dist/bundle-analysis.html",
              open: true,
              gzipSize: true,
            });
          })(),
        ]
      : []),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    // Production optimizations
    target: "es2020",
    minify: "esbuild",
    rollupOptions: {
      output: {
        // Content hash for cache busting
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-switch",
            "@radix-ui/react-label",
            "@radix-ui/react-separator",
          ],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-charts": ["recharts"],
        },
      },
    },
    // Warn on large chunks
    chunkSizeWarningLimit: 500,
  },
}));
