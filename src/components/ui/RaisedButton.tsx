import type { ButtonHTMLAttributes } from "react";
import { classes } from "../../ui";

type RaisedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Readonly<{
  tone?: "cream" | "yellow";
}>;

export function RaisedButton({ tone = "cream", className, children, ...props }: RaisedButtonProps) {
  return (
    <button
      {...props}
      className={classes(
        "rounded-xl border-[0.1875rem] border-navy font-black text-navy shadow-[0_0.25rem_0_#17233f] hover:-translate-y-px hover:shadow-[0_0.3125rem_0_#17233f] active:translate-y-1 active:shadow-none",
        tone === "yellow" ? "bg-yellow" : "bg-cream",
        className,
      )}
    >
      {children}
    </button>
  );
}
