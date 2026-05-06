import { createRoot } from "react-dom/client";
import { initSentry } from "./lib/sentry";
import { initAnalytics } from "./lib/analytics";
import App from "./App.tsx";
import "./index.css";

// Init error tracking and analytics before rendering
initSentry();
initAnalytics();

const rootEl = document.getElementById("root");

if (!rootEl) {
  // Fallback if root element is missing (shouldn't happen in production)
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;">
      <div style="text-align:center;">
        <h1 style="font-size:1.5rem;margin-bottom:0.5rem;">Error de carga</h1>
        <p style="color:#666;">No se encontró el elemento raíz. Recargá la página.</p>
        <button onclick="window.location.reload()" style="margin-top:1rem;padding:0.5rem 1rem;cursor:pointer;">
          Recargar
        </button>
      </div>
    </div>
  `;
} else {
  createRoot(rootEl).render(<App />);
}

// Register service worker for PWA offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      // SW registration failed — app works fine without it
      console.debug("[SW] Registration failed:", err);
    });
  });
}
