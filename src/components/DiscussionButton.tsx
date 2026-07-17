import { RaisedButton } from "./ui/RaisedButton";
import { classes } from "../ui";

type DiscussionButtonProps = {
  onClick: () => void;
  className?: string;
};

export function DiscussionButton({ onClick, className }: DiscussionButtonProps) {
  return (
    <RaisedButton
      className={classes("flex items-center justify-center", className)}
      type="button"
      onClick={onClick}
    >
      <span>Aptarkime</span>
    </RaisedButton>
  );
}
