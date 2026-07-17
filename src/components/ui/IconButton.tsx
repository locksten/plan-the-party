import type { ButtonHTMLAttributes } from "react";
import { classes } from "../../ui";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Readonly<{
  shape?: "round" | "square";
  tone?: "cream" | "white" | "yellow";
}>;

export function IconButton({ shape = "square", tone = "white", className, children, ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      className={classes(
        "grid place-items-center border-[0.125rem] border-navy text-navy disabled:cursor-not-allowed disabled:opacity-40",
        shape === "round" ? "size-10 rounded-full shadow-[0_0.1875rem_0_#17233f] active:translate-y-0.5 active:shadow-[0_0.0625rem_0_#17233f]" : "size-11 rounded-lg hover:bg-yellow",
        tone === "cream" ? "bg-cream hover:bg-white" : tone === "yellow" ? "bg-yellow" : "bg-white",
        className,
      )}
    >
      {children}
    </button>
  );
}
