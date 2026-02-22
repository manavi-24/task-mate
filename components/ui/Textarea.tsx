"use client";

import * as React from "react";
import { cn } from "./cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          "w-full min-h-[120px] resize-y rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 shadow-sm transition",
          "border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
          hasError && "border-red-500/40 focus:ring-red-500/40",
          className
        )}
      />
    );
  }
);

Textarea.displayName = "Textarea";
