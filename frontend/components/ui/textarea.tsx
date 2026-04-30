"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "flex w-full rounded-md border border-rule-strong bg-surface px-4 py-3 text-[15px] text-foreground",
            "placeholder:text-subtle resize-none",
            "transition-colors duration-150",
            "focus:outline-none focus:border-primary focus:bg-surface-elevated",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error/60 focus:border-error",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
