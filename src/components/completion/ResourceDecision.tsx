import { COMPLETION_ART_SOURCES, type CompletionArtId } from "../../completionArt";
import { classes } from "../../ui";
import { SelectedMark } from "./SelectedMark";
import { useI18n } from "../../i18n/I18nProvider";

export function ResourceDecision<Choice extends string>({ title, amount, art, options, actionArt, choice, onChoice }: {
  title: string;
  amount: string;
  art: CompletionArtId;
  options: ReadonlyArray<{ id: Choice; label: string }>;
  actionArt: Readonly<Record<Choice, string>>;
  choice: Choice | null;
  onChoice: (choice: Choice | null) => void;
}) {
  const { translations } = useI18n();
  return (
    <section className="grid min-w-0 grid-cols-[minmax(8.75rem,0.8fr)_minmax(0,1.7fr)] items-center gap-2 px-3 py-2 text-center">
      <div className="relative flex min-h-0 flex-col items-center justify-center self-stretch">
        <img className="max-h-[clamp(6.5rem,10vw,9rem)] w-[clamp(6.5rem,10vw,8.75rem)] shrink-0 object-contain" src={COMPLETION_ART_SOURCES[art]} alt="" draggable={false} />
        <h3 className="m-0 text-[clamp(1.25rem,1.8vw,1.75rem)] leading-none">{title}</h3>
        <strong className="mt-1 inline-block rounded-full bg-yellow px-3 py-0.5 text-xl"><span className="relative top-[0.5px]">{amount}</span></strong>
      </div>

      <div className="flex flex-wrap content-center justify-center gap-x-2 gap-y-1" role="group" aria-label={translations.completion.foodActionGroup(title)}>
        {options.map((option) => {
          const selected = choice === option.id;
          return (
            <button
              key={option.id}
              className="group flex w-[clamp(6.875rem,9vw,8.75rem)] min-w-0 flex-col items-center justify-start rounded-xl px-1 py-1 outline-none focus-visible:ring-[0.25rem] focus-visible:ring-blue"
              type="button"
              aria-pressed={selected}
              onClick={() => onChoice(selected ? null : option.id)}
            >
              <span className={classes(
                "relative grid size-[clamp(4.25rem,7vw,6rem)] place-items-center rounded-full border-[0.1875rem] border-transparent transition group-hover:-translate-y-1 group-hover:bg-mint-soft",
                selected && "animate-choice-pop border-navy bg-yellow shadow-[0_0.25rem_0_#17233f] group-hover:bg-yellow",
              )}>
                <img className="size-[86%] object-contain" src={actionArt[option.id]} alt="" draggable={false} />
                {selected && <SelectedMark />}
              </span>
              <span className="mt-1 max-w-32 text-[clamp(0.75rem,1.05vw,0.9375rem)] font-black leading-[1.05]">{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
