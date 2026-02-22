import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export type BadgeVariant =
  | "emerald"
  | "blue"
  | "purple"
  | "amber"
  | "gray";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  blue: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-200",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  gray: "border-white/10 bg-white/5 text-white/70",
};

export function Badge({ variant = "gray", className, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        variants[variant],
        className
      )}
    />
  );
}
