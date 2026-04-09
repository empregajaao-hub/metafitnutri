import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Web Push needs a real service worker file (public/sw.js)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.log("SW registration failed:", err);
    });
  });
}

// Capture install prompt globally so the /install page can use it even if event fires early
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as any).__pwaInstallPrompt = e;
});

createRoot(document.getElementById("root")!).render(<App />);
