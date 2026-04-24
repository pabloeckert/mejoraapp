import { createRoot } from "react-dom/client";
import { initSentry } from "./lib/sentry";
import { initAnalytics } from "./lib/analytics";
import App from "./App.tsx";
import "./index.css";

// Init error tracking and analytics before rendering
initSentry();
initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW registration failed — app works fine without it
    });
  });
}
