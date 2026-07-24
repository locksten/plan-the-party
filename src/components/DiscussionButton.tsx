import { RaisedButton } from "./ui/RaisedButton";
import { classes } from "../ui";
import { useI18n } from "../i18n/I18nProvider";

type DiscussionButtonProps = {
  onClick: () => void;
  className?: string;
};

export function DiscussionButton({ onClick, className }: DiscussionButtonProps) {
  const { translations } = useI18n();
  return (
    <RaisedButton
      className={classes("flex items-center justify-center", className)}
      type="button"
      onClick={onClick}
    >
      <span>{translations.discussionButton}</span>
    </RaisedButton>
  );
}
