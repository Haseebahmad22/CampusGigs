"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = Omit<Toast, "id" | "variant"> & { variant?: ToastVariant };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const ICONS: Record<
  ToastVariant,
  React.ComponentType<{ className?: string }>
> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const ICON_CLASSES: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-error",
  info: "text-primary",
};

const LEFT_BORDER: Record<ToastVariant, string> = {
  success: "border-l-success",
  error: "border-l-error",
  info: "border-l-primary",
};

const AUTO_DISMISS_MS = 4500;

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (input: ToastInput) => {
      idRef.current += 1;
      const id = idRef.current;
      const next: Toast = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "info",
      };
      setToasts((prev) => [...prev, next]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const value = React.useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) =>
        toast({ title, description, variant: "success" }),
      error: (title, description) =>
        toast({ title, description, variant: "error" }),
      info: (title, description) =>
        toast({ title, description, variant: "info" }),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-md border border-rule-strong border-l-4 bg-surface p-4",
                "shadow-[0_2px_0_0_rgba(196,187,161,0.5)]",
                LEFT_BORDER[t.variant],
                "animate-in slide-in-from-right-4 fade-in duration-200"
              )}
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", ICON_CLASSES[t.variant])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                {t.description ? (
                  <p className="mt-0.5 text-xs text-muted">{t.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded-sm p-1 text-subtle transition-colors hover:bg-surface-elevated hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToasterProvider>.");
  }
  return ctx;
}
