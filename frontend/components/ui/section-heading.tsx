import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  kicker?: string;
  action?: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
  serif?: boolean;
}

export function SectionHeading({
  title,
  kicker,
  action,
  as = "h2",
  className,
  serif = true,
}: SectionHeadingProps) {
  const Heading = as;
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4 border-b border-rule pb-3",
        className
      )}
    >
      <div className="min-w-0">
        {kicker ? (
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-subtle mb-1.5">
            {kicker}
          </span>
        ) : null}
        <Heading
          className={cn(
            "tracking-tight text-foreground",
            serif ? "font-serif" : "font-sans font-medium",
            as === "h2" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          )}
        >
          {title}
        </Heading>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
