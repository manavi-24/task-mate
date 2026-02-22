"use client";

import * as React from "react";
import { cn } from "./cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 shadow-sm transition",
          "border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
          hasError && "border-red-500/40 focus:ring-red-500/40",
          className
        )}
      />
    );
  }
);

Input.displayName = "Input";
