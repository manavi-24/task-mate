import type { ReactNode } from "react";
import { cn } from "./cn";

type InlineAlertProps = {
  variant?: "success" | "error" | "info";
  title?: string;
  children: ReactNode;
  className?: string;
};

const styles: Record<NonNullable<InlineAlertProps["variant"]>, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  error: "border-red-500/30 bg-red-500/10 text-red-200",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-200",
};

export function InlineAlert({
  variant = "info",
  title,
  children,
  className,
}: InlineAlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : undefined}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        styles[variant],
        className
      )}
    >
      {title && (
        <p className="font-semibold text-white/90 mb-0.5">
          {title}
        </p>
      )}
      <div className="text-white/80">{children}</div>
    </div>
  );
}
