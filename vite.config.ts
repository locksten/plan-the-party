import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { siteMetadataPlugin } from "./scripts/site-metadata-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), siteMetadataPlugin()],
});
