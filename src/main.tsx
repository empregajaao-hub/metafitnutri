import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Web Push needs a real service worker file (public/sw.js)
// O Vite PWA Plugin cuida do registro do SW se configurado corretamente.
// Mas se precisarmos de registro manual, devemos apontar para o arquivo gerado ou usar a estratégia do plugin.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/registerSW.js").catch((err) => {
      console.log("SW registration failed:", err);
    });
  });
}

// Capture install prompt globally so the /install page can use it even if event fires early
window.addEventListener("beforeinstallprompt", (e) => {
  try {
    e.preventDefault();
    (window as any).__pwaInstallPrompt = e;
  } catch (error) {
    console.log("Install prompt error:", error);
  }
});

// Global error handler
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found");
} else {
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Error rendering app:", error);
  }
}
