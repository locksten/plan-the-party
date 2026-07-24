import { ASSET_MANIFEST } from "./assetManifest";

const CACHE_WARM_BATCH_SIZE = 8;
let cacheWarmPromise: Promise<void> | undefined;

function loadAtLowPriority(source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.fetchPriority = "low";
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to preload image "${source}".`));
    image.src = source;
  });
}

async function loadInBatches(sources: readonly string[]): Promise<void> {
  for (let start = 0; start < sources.length; start += CACHE_WARM_BATCH_SIZE) {
    const batch = sources.slice(start, start + CACHE_WARM_BATCH_SIZE);
    await Promise.all(batch.map(loadAtLowPriority));
  }
}

export function warmGameImageCache(): Promise<void> {
  cacheWarmPromise ??= loadInBatches(ASSET_MANIFEST.map((asset) => asset.source));
  return cacheWarmPromise;
}
