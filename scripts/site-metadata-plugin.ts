import type { Plugin } from "vite";

/** Bake absolute URLs into HTML so link crawlers do not need JavaScript. */
export function siteMetadataPlugin(): Plugin {
  let origin: string | undefined;

  return {
    name: "site-metadata",
    apply: "build",
    configResolved(config) {
      const domain = config.env.VITE_VERCEL_PROJECT_PRODUCTION_URL;
      origin = domain ? new URL(`https://${domain}`).origin : undefined;
    },
    transformIndexHtml() {
      if (!origin) return [];

      return [
        { tag: "link", attrs: { rel: "canonical", href: `${origin}/` }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:url", content: `${origin}/` }, injectTo: "head" },
        {
          tag: "meta",
          attrs: { property: "og:image", content: `${origin}/og-image.png` },
          injectTo: "head",
        },
      ];
    },
  };
}
