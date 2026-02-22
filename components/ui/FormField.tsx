import type { ReactNode } from "react";
import { cn } from "./cn";

type FormFieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium text-white/90">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-300">{error}</p>
      ) : hint ? (
        <p className="text-xs text-white/50">{hint}</p>
      ) : null}
    </div>
  );
}
