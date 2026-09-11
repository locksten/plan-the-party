# Icons and sharing metadata

The source artwork is `src/assets/ui/favicon.svg`. Run `direnv exec . python scripts/generate-brand-assets.py` to regenerate the checked-in PNG and ICO assets. The generator requires ImageMagick (`magick`) and Pillow with WOFF2 font support, both provided by `direnv exec .`. Deployment uses the checked-in files and does not require these tools.

Tab icons are transparent. Apple and app icons use the app's cream background with padding. The separate maskable icon keeps all artwork inside the centered 80%-diameter safe circle. The manifest provides home-screen identity and standalone display; it does not add offline support.

The description is stored in `index.html` and `public/site.webmanifest`. The sharing image uses the same circle artwork, the app title, and the bundled Nunito font at weight 700. Fixed sharing tags live in `index.html`.

During builds, `scripts/site-metadata-plugin.ts` adds canonical and Open Graph URLs using Vercel's automatic `VITE_VERCEL_PROJECT_PRODUCTION_URL` from Vite's resolved environment. Enable automatic system environment-variable exposure in Vercel project settings; no custom URL variable is required. Preview deployments also reference the production domain. Local development and builds without a production domain omit URL-dependent tags. Rebuild after changing the production domain.
