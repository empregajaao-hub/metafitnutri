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

createRoot(document.getElementById("root")!).render(<App />);
