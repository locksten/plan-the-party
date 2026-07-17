import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/nunito/index.css";
import { App } from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Expected an element with id `root`.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
