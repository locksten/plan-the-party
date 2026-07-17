import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { assert } from "../../assert";
import { ASSET_MANIFEST, type AssetManifestEntry } from "../../assetManifest";

type AssetDimensions = Readonly<{ width: number; height: number }>;

const checkerboardStyle = {
  backgroundColor: "#fff",
  backgroundImage: "linear-gradient(45deg, #e8e8e8 25%, transparent 25%), linear-gradient(-45deg, #e8e8e8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e8e8 75%), linear-gradient(-45deg, transparent 75%, #e8e8e8 75%)",
  backgroundPosition: "0 0, 0 0.5rem, 0.5rem -0.5rem, -0.5rem 0",
  backgroundSize: "1rem 1rem",
} as const satisfies CSSProperties;

function assetGroup(logicalPath: string): string {
  const parts = logicalPath.split("/").filter(Boolean);
  return parts.slice(1, -1).join(" / ") || "assets";
}

function assetName(logicalPath: string): string {
  return logicalPath.slice(logicalPath.lastIndexOf("/") + 1);
}

function AssetCard({ asset, onOpen }: { asset: AssetManifestEntry; onOpen: () => void }) {
  const [dimensions, setDimensions] = useState<AssetDimensions | null>(null);
  const [failed, setFailed] = useState(false);

  return (
    <button
      className="min-w-0 overflow-hidden rounded-2xl border-[0.125rem] border-navy bg-paper text-left shadow-[0_0.25rem_0_#17233f] transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-[0.25rem] focus-visible:ring-blue"
      type="button"
      onClick={onOpen}
    >
      <div
        className="grid aspect-square place-items-center overflow-hidden p-3"
        style={checkerboardStyle}
      >
        {failed ? (
          <strong className="rounded-lg bg-coral px-3 py-2 text-center">Failed to load</strong>
        ) : (
          <img
            className="size-full object-contain"
            src={asset.source}
            alt=""
            loading="lazy"
            draggable={false}
            onLoad={(event) => setDimensions({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <div className="border-t-[0.125rem] border-navy px-3 py-2">
        <strong className="block truncate text-sm" title={assetName(asset.logicalPath)}>{assetName(asset.logicalPath)}</strong>
        <small className="block truncate font-bold text-muted" title={asset.logicalPath}>
          {dimensions === null ? "Loading…" : `${dimensions.width} × ${dimensions.height}`} · {asset.logicalPath}
        </small>
      </div>
    </button>
  );
}

function AssetViewer({ asset, assets, onChange, onClose }: {
  asset: AssetManifestEntry;
  assets: readonly AssetManifestEntry[];
  onChange: (asset: AssetManifestEntry) => void;
  onClose: () => void;
}) {
  const index = assets.indexOf(asset);
  assert(index >= 0, `Unknown gallery asset “${asset.logicalPath}”.`);

  const previousAsset = assets[(index - 1 + assets.length) % assets.length];
  const nextAsset = assets[(index + 1) % assets.length];
  assert(previousAsset !== undefined && nextAsset !== undefined, "The asset gallery must not be empty.");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") onChange(previousAsset);
      else if (event.key === "ArrowRight") onChange(nextAsset);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextAsset, onChange, onClose, previousAsset]);

  return (
    <div
      className="fixed inset-0 z-[200] grid grid-rows-[auto_minmax(0,1fr)] bg-[#0b1429]/95 p-5 text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`Asset ${index + 1} of ${assets.length}: ${assetName(asset.logicalPath)}`}
    >
      <header className="flex items-center gap-4 pb-4">
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-2xl">{assetName(asset.logicalPath)}</strong>
          <small className="block truncate font-bold text-white/70">{asset.logicalPath}</small>
        </div>
        <strong>{index + 1} / {assets.length}</strong>
        <button className="grid size-12 place-items-center rounded-xl border-[0.1875rem] border-white bg-navy text-2xl font-black" type="button" onClick={onClose} aria-label="Close asset viewer">×</button>
      </header>

      <div className="grid min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5">
        <button className="grid size-16 place-items-center rounded-full border-[0.1875rem] border-white bg-navy text-4xl font-black shadow-[0_0.25rem_0_#fff]" type="button" onClick={() => onChange(previousAsset)} aria-label="Previous asset">←</button>
        <div className="flex size-full min-h-0 items-center justify-center overflow-hidden rounded-2xl border-[0.1875rem] border-white p-5" style={checkerboardStyle}>
          <img className="block h-auto max-h-full w-auto max-w-full object-contain" src={asset.source} alt={assetName(asset.logicalPath)} draggable={false} />
        </div>
        <button className="grid size-16 place-items-center rounded-full border-[0.1875rem] border-white bg-navy text-4xl font-black shadow-[0_0.25rem_0_#fff]" type="button" onClick={() => onChange(nextAsset)} aria-label="Next asset">→</button>
      </div>
    </div>
  );
}

export function AssetGallery() {
  const [query, setQuery] = useState("");
  const [openAsset, setOpenAsset] = useState<AssetManifestEntry | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchingAssets = useMemo(
    () => normalizedQuery === ""
      ? ASSET_MANIFEST
      : ASSET_MANIFEST.filter((asset) => asset.logicalPath.toLocaleLowerCase().includes(normalizedQuery)),
    [normalizedQuery],
  );
  const groups = useMemo(
    () => matchingAssets.reduce((grouped, asset) => {
      const group = assetGroup(asset.logicalPath);
      grouped.set(group, [...(grouped.get(group) ?? []), asset]);
      return grouped;
    }, new Map<string, readonly AssetManifestEntry[]>()),
    [matchingAssets],
  );

  return (
    <main className="game-scrollbar h-dvh overflow-y-auto bg-cream px-6 py-5 text-navy">
      <header className="sticky top-0 z-10 mb-6 flex items-center gap-4 rounded-2xl border-[0.1875rem] border-navy bg-paper px-5 py-3 shadow-[0_0.3rem_0_#17233f]">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-3xl leading-none">Asset gallery</h1>
          <p className="mb-0 mt-1 font-bold text-muted">{matchingAssets.length} of {ASSET_MANIFEST.length} image assets</p>
        </div>
        <label className="flex items-center gap-2 font-black">
          Search
          <input
            className="w-80 rounded-xl border-[0.1875rem] border-navy bg-white px-3 py-2 outline-none focus:ring-[0.25rem] focus:ring-blue"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </label>
        <a className="rounded-xl border-[0.1875rem] border-navy bg-yellow px-4 py-2 font-black shadow-[0_0.1875rem_0_#17233f]" href="/">
          Back
        </a>
      </header>

      {[...groups].map(([group, assets]) => (
        <section className="mb-8" key={group}>
          <h2 className="mb-3 mt-0 text-2xl">{group} <small className="text-base text-muted">({assets.length})</small></h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-4">
            {assets.map((asset) => <AssetCard key={asset.logicalPath} asset={asset} onOpen={() => setOpenAsset(asset)} />)}
          </div>
        </section>
      ))}

      {matchingAssets.length === 0 && <p className="py-20 text-center text-2xl font-black text-muted">No matching assets.</p>}

      {openAsset !== null && (
        <AssetViewer
          asset={openAsset}
          assets={matchingAssets}
          onChange={setOpenAsset}
          onClose={() => setOpenAsset(null)}
        />
      )}
    </main>
  );
}
