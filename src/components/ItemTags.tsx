import { type ItemTag } from "../domain";
import { useI18n } from "../i18n/I18nProvider";
import { classes } from "../ui";

export function ItemTags({ tags, className }: { tags: readonly ItemTag[]; className: string }) {
  const { translations } = useI18n();
  if (tags.length === 0) return null;

  return (
    <span className={classes("absolute z-30 flex items-center gap-1", className)}>
      {tags.map((tag, index) => (
        <span
          className={classes(
            "rounded-full border-navy font-black leading-none tracking-[-0.01em]",
            tag.kind === "hype"
              ? "hype-tag-pulse -rotate-2 border-[0.1875rem] bg-blue px-2 py-1 text-[0.6875rem] shadow-[0_0.125rem_0_#17233f]"
              : "border-[0.125rem] bg-yellow px-2 py-0.5 text-[0.625rem]",
          )}
          key={`${tag.kind}:${index}`}
        >
          <span className="relative top-[0.0625rem]">{translations.itemTag(tag)}</span>
        </span>
      ))}
    </span>
  );
}
