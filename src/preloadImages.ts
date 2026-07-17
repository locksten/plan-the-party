import { CHALLENGE_ART_SOURCES, EVENT_ART_SOURCES } from "./cardArt";
import { ITEM_ART_SOURCES } from "./itemArt";

const itemSources = Object.values(ITEM_ART_SOURCES);
const cardSources = [...Object.values(CHALLENGE_ART_SOURCES), ...Object.values(EVENT_ART_SOURCES)];

const retainedImages: HTMLImageElement[] = [];
let preloadPromise: Promise<void> | undefined;

function loadAndDecode(source: string): Promise<void> {
  const image = new Image();
  image.decoding = "async";
  image.src = source;
  retainedImages.push(image);

  return image.decode().catch((cause: unknown) => {
    throw new Error(`Nepavyko iš anksto įkelti paveikslėlio „${source}“.`, { cause });
  });
}

export function preloadGameImages(): Promise<void> {
  preloadPromise ??= Promise.all(itemSources.map(loadAndDecode))
    .then(() => Promise.all(cardSources.map(loadAndDecode)))
    .then(() => undefined);

  return preloadPromise;
}
