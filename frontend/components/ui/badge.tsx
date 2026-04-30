"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "error"
    | "primary"
    | "secondary"
    | "accent";
  size?: "sm" | "md";
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-surface-elevated text-muted border-border",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  error: "bg-error/10 text-error border-error/30",
  primary: "bg-primary/10 text-primary border-primary/30",
  secondary: "bg-surface-elevated text-muted border-rule-strong",
  accent: "bg-accent/10 text-accent border-accent/30",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono uppercase border rounded-sm select-none",
        size === "sm" && "px-2 py-0.5 text-[10px] tracking-[0.12em]",
        size === "md" && "px-2.5 py-1 text-xs tracking-[0.10em]",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
