import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { App } from "./App";
import { I18nProvider } from "./i18n/I18nProvider";
import "./fonts.css";
import "./styles.css";

const APP_FONT = '900 1rem "Nunito Variable"';
const APP_FONT_SAMPLE = "AaĄČĘĖĮŠŲŪŽąčęėįšųūž";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Expected an element with id `root`.");
}

async function renderApp(container: HTMLElement) {
  const loadedFonts = await document.fonts.load(APP_FONT, APP_FONT_SAMPLE);

  if (loadedFonts.length === 0 || loadedFonts.some((font) => font.status !== "loaded")) {
    throw new Error("Expected the Nunito application font to load before rendering.");
  }

  await document.fonts.ready;

  if (!document.fonts.check(APP_FONT, APP_FONT_SAMPLE)) {
    throw new Error("Expected the loaded Nunito application font to be ready before rendering.");
  }

  createRoot(container).render(
    <StrictMode>
      <I18nProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </I18nProvider>
    </StrictMode>,
  );
}

void renderApp(rootElement);
