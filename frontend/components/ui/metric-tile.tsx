"use client";

import * as React from "react";
import { motion, useMotionValue, animate, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "md" | "lg" | "xl";

interface MetricTileProps {
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  sparkline?: number[];
  footnote?: string;
  size?: Size;
  href?: string;
  onClick?: () => void;
  className?: string;
  tone?: "default" | "accent";
  invertDelta?: boolean;
}

const VALUE_SIZE: Record<Size, string> = {
  md: "text-5xl md:text-6xl",
  lg: "text-6xl md:text-7xl",
  xl: "text-7xl md:text-8xl lg:text-9xl",
};

function CountUp({
  to,
  className,
}: {
  to: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(reduce ? to : 0);
  const [display, setDisplay] = React.useState(reduce ? to : 0);

  React.useEffect(() => {
    if (reduce) {
      setDisplay(to);
      return;
    }
    const controls = animate(motionValue, to, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [to, motionValue, reduce]);

  return <span className={className}>{display}</span>;
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-9 w-24 text-foreground/40"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function MetricTile({
  label,
  value,
  delta,
  deltaLabel,
  sparkline,
  footnote,
  size = "md",
  href,
  onClick,
  className,
  tone = "default",
  invertDelta = false,
}: MetricTileProps) {
  const Container: React.ElementType = href ? "a" : onClick ? "button" : "div";
  const containerProps = href
    ? { href }
    : onClick
      ? { onClick, type: "button" as const }
      : {};

  const isNumber = typeof value === "number";
  const showCountUp = isNumber;

  const deltaPositive = delta !== undefined && delta > 0;
  const deltaShownGood = invertDelta ? !deltaPositive : deltaPositive;
  const deltaColor = delta === undefined
    ? "text-muted"
    : deltaShownGood
      ? "text-success"
      : "text-error";

  return (
    <Container
      {...containerProps}
      className={cn(
        "group flex h-full flex-col justify-between rounded-md border border-border bg-surface p-5 md:p-6 text-left transition-colors",
        (href || onClick) && "hover:bg-surface-elevated hover:border-rule-strong cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
          {label}
        </span>
        {sparkline ? <Sparkline values={sparkline} /> : null}
      </div>

      <div className="my-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className={cn(
            "font-serif tabular-nums leading-none",
            VALUE_SIZE[size],
            tone === "accent" ? "text-accent" : "text-foreground"
          )}
        >
          {showCountUp ? <CountUp to={value as number} /> : value}
        </motion.div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          {delta !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono text-[11px] tabular-nums",
                deltaColor
              )}
            >
              {deltaPositive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {Math.abs(delta)}%
              {deltaLabel ? (
                <span className="text-subtle ml-1 normal-case">{deltaLabel}</span>
              ) : null}
            </span>
          ) : null}
          {footnote ? (
            <p className="mt-1 text-xs text-muted leading-snug">{footnote}</p>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
