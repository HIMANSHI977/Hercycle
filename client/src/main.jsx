import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";

// Register Service Worker for desktop notifications
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      console.log(
        "HerCycle Service Worker registered:",
        registration.scope
      );
    })
    .catch((error) => {
      console.error(
        "Service Worker registration failed:",
        error
      );
    });
}

const savedTheme = localStorage.getItem("hercycle_theme") || "light";
document.documentElement.dataset.theme = savedTheme;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
