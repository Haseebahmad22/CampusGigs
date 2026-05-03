"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-[90] flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-foreground/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative w-full max-w-md rounded-md border border-rule-strong bg-surface p-6",
          "shadow-[0_2px_0_0_rgba(196,187,161,0.5)]",
          "max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm p-1 text-subtle transition-colors hover:bg-surface-elevated hover:text-foreground"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>
        <h2
          id="dialog-title"
          className="pr-8 font-serif text-2xl text-foreground"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
        {children ? <div className="mt-5">{children}</div> : null}
        {footer ? (
          <div className="mt-6 flex justify-end gap-2">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
