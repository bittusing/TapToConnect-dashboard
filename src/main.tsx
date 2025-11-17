import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./scrollBar.css";
import "./css/linePattern.css";
import "./css/satoshi.css";
import "./css/style.css";
import "flatpickr/dist/flatpickr.min.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
