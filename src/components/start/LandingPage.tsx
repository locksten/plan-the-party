import { EVENT_ART_SOURCES } from "../../cardArt";
import { ITEM_ART_SOURCES } from "../../itemArt";
import type { SavedMissionSummary } from "../../missionStorage";
import { useI18n } from "../../i18n/I18nProvider";

const tiles = [
  {
    image: ITEM_ART_SOURCES["paper-airplane-challenge"],
    color: "bg-orange-soft",
  },
  {
    image: ITEM_ART_SOURCES["mini-sandwiches"],
    color: "bg-blue-soft",
  },
  {
    image: EVENT_ART_SOURCES["spilled-drink"],
    color: "bg-yellow",
  },
  {
    image: ITEM_ART_SOURCES.quiz,
    color: "bg-purple-soft",
  },
] as const;

type LandingPageProps = {
  missions: readonly SavedMissionSummary[];
  onStart: () => void;
  onContinue: (id: string) => void;
  onRequestDelete: (mission: SavedMissionSummary) => void;
};

export function LandingPage({ missions, onStart, onContinue, onRequestDelete }: LandingPageProps) {
  const { translations } = useI18n();
  return (
    <section className="grid h-dvh grid-cols-[0.82fr_1.18fr]">
      <div className="relative flex flex-col justify-center overflow-hidden bg-coral px-[clamp(3rem,6vw,5.75rem)] pb-36 pt-10">
        <div className="absolute -right-24 top-14 size-64 rounded-full bg-yellow/55" aria-hidden="true" />
        <h1 className="relative m-0 text-[clamp(3.625rem,5.3vw,4.75rem)] font-black leading-[0.84] tracking-[-0.065em] text-cream [text-shadow:0.3125rem_0.3125rem_0_#17233f]">
          <span className="block whitespace-nowrap">{translations.landing.heroLines[0]}</span>
          <span className="block whitespace-nowrap text-yellow">{translations.landing.heroLines[1]}</span>
          <span className="block whitespace-nowrap">{translations.landing.heroLines[2]}</span>
        </h1>
        <button
          className="relative mt-8 min-h-16 self-start rounded-2xl border-[0.25rem] border-navy bg-yellow px-10 text-2xl font-black text-navy shadow-[0_0.4375rem_0_#17233f] transition hover:-translate-y-0.5 hover:shadow-[0_0.5625rem_0_#17233f] active:translate-y-1 active:shadow-[0_0.1875rem_0_#17233f]"
          type="button"
          onClick={onStart}
        >
          {translations.landing.start}
        </button>

        {missions.length > 0 && (
          <div className="game-scrollbar relative mt-7 flex max-h-[23.75rem] w-full max-w-[32.5rem] flex-col gap-3 overflow-y-auto pb-2 pr-3 pt-1">
            {missions.map((mission) => (
              <div className="flex gap-2" key={mission.id}>
                <button
                  className="min-h-14 min-w-0 flex-1 rounded-xl border-[0.1875rem] border-navy bg-cream px-5 text-left text-xl font-black shadow-[0_0.25rem_0_#17233f] hover:-translate-y-px hover:bg-white active:translate-y-1 active:shadow-none"
                  type="button"
                  onClick={() => onContinue(mission.id)}
                >
                  {translations.landing.continueClass(mission.classLabel)}
                </button>
                <button
                  className="grid size-14 shrink-0 place-items-center rounded-xl border-[0.1875rem] border-navy bg-cream text-[2rem] font-black leading-none shadow-[0_0.25rem_0_#17233f] hover:-translate-y-px hover:bg-white active:translate-y-1 active:shadow-none"
                  type="button"
                  aria-label={translations.landing.deleteClassSave(mission.classLabel)}
                  title={translations.landing.deleteClassSave(mission.classLabel)}
                  onClick={() => onRequestDelete(mission)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-5 p-8 pr-12">
        {tiles.map((tile, index) => (
          <article key={translations.landing.tiles[index].title} className={`relative isolate flex min-h-0 flex-col overflow-hidden rounded-[2.375rem] border-[0.25rem] border-navy ${tile.color} p-6 shadow-[0.4375rem_0.5rem_0_#17233f] ${index % 2 === 0 ? "-rotate-1" : "rotate-1"}`}>
            <h2 className="relative z-10 m-0 text-[clamp(2rem,3vw,3rem)] font-black leading-none">{translations.landing.tiles[index].title}</h2>
            <p className="relative z-10 mt-2 text-xl font-extrabold">{translations.landing.tiles[index].text}</p>
            <img
              className="absolute bottom-4 right-4 h-auto w-auto max-h-[52%] max-w-[52%]"
              src={tile.image}
              alt=""
              draggable={false}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
