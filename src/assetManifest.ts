import { assert } from "./assert";

export type AssetManifestEntry = Readonly<{
  logicalPath: string;
  source: string;
}>;

const ASSET_MODULE_PREFIX = "./assets/";
const assetModules = import.meta.glob("./assets/**/*.webp", {
  eager: true,
  import: "default",
});

export const ASSET_MANIFEST: readonly AssetManifestEntry[] = Object.entries(assetModules)
  .map(([modulePath, source]) => {
    assert(modulePath.startsWith(ASSET_MODULE_PREFIX), `Unexpected asset module path “${modulePath}”.`);
    assert(typeof source === "string", `Asset module “${modulePath}” must export a URL string.`);
    return {
      logicalPath: `/assets/${modulePath.slice(ASSET_MODULE_PREFIX.length)}`,
      source,
    };
  })
  .sort((left, right) => left.logicalPath.localeCompare(right.logicalPath));

assert(ASSET_MANIFEST.length > 0, "The asset manifest must not be empty.");
