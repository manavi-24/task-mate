import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hoverable?: boolean;
};

export function Card({
  className,
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]",
        hoverable &&
          "transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] hover:shadow-[0_30px_80px_-40px_rgba(99,102,241,0.35)]",
        className
      )}
    />
  );
}
