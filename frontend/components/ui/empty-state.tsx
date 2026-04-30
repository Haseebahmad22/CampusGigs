import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Stamp } from "./stamp";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-elevated/60 px-6 py-14 text-center overflow-hidden",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Stamp variant="empty" tone="moss" size={180} rotation={-6} />
      </div>
      <div className="relative">
        <h3 className="font-serif text-2xl text-foreground">{title}</h3>
        {description ? (
          <p className="mt-2 max-w-sm mx-auto text-[14px] text-muted">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}
