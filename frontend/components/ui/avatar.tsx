"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Stamp } from "./stamp";

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "circle" | "square";

interface AvatarProps {
  src?: string | null;
  fallback?: string | null;
  size?: Size;
  variant?: Variant;
  verified?: boolean;
  className?: string;
  alt?: string;
}

const SIZE_PX: Record<Size, number> = {
  sm: 28,
  md: 40,
  lg: 56,
  xl: 96,
};

const SIZE_TEXT: Record<Size, string> = {
  sm: "text-[11px]",
  md: "text-sm",
  lg: "text-base",
  xl: "text-2xl",
};

function initialsOf(value: string | null | undefined): string {
  if (!value) return "·";
  const parts = value.trim().split(/\s+/).slice(0, 2);
  return (
    parts.map((p) => p[0]?.toUpperCase() ?? "").join("") ||
    value[0].toUpperCase()
  );
}

export function Avatar({
  src,
  fallback,
  size = "md",
  variant = "circle",
  verified,
  className,
  alt,
}: AvatarProps) {
  const px = SIZE_PX[size];
  const radius = variant === "circle" ? "rounded-full" : "rounded-sm";
  const initials = initialsOf(fallback);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-visible",
        className
      )}
      style={{ width: px, height: px }}
    >
      <span
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden border border-rule-strong bg-surface-elevated",
          radius
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt ?? fallback ?? "Avatar"}
            width={px}
            height={px}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={cn(
              "font-serif text-foreground select-none",
              SIZE_TEXT[size]
            )}
          >
            {initials}
          </span>
        )}
      </span>
      {verified ? (
        <span
          className="absolute -bottom-0.5 -right-0.5"
          style={{ width: px * 0.32, height: px * 0.32 }}
        >
          <Stamp variant="verified" tone="moss" size={px * 0.32} />
        </span>
      ) : null}
    </span>
  );
}
