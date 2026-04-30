"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type StampTone = "moss" | "terracotta";
type StampVariant = "seal" | "verified" | "empty";

interface StampProps {
  variant?: StampVariant;
  tone?: StampTone;
  size?: number;
  rotation?: number;
  className?: string;
  label?: string;
}

const TONE_HEX: Record<StampTone, string> = {
  moss: "#1F4D3F",
  terracotta: "#E8743C",
};

export function Stamp({
  variant = "seal",
  tone = "moss",
  size = 96,
  rotation,
  className,
  label = "CAMPUS · GIGS · CAMPUS · GIGS · ",
}: StampProps) {
  const reactId = React.useId();
  const stampId = `stamp-${reactId.replace(/[^a-zA-Z0-9-]/g, "")}`;

  const color = TONE_HEX[tone];
  const defaultRotation = variant === "verified" ? 0 : -3;
  const rot = rotation ?? defaultRotation;
  const opacity = variant === "empty" ? 0.35 : 1;

  if (variant === "verified") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={cn("inline-block", className)}
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill={color}
          stroke="#F7F4EC"
          strokeWidth="1.5"
        />
        <path
          d="M8 12.5l2.5 2.5L16 9.5"
          fill="none"
          stroke="#F7F4EC"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const circlePathId = `${stampId}-text-path`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn("inline-block", className)}
      style={{ transform: `rotate(${rot}deg)`, opacity }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${stampId}-noise`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="3"
          />
          <feDisplacementMap in="SourceGraphic" scale="0.7" />
        </filter>
        <path
          id={circlePathId}
          d="M 60,60 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
          fill="none"
        />
      </defs>
      <g
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        filter={`url(#${stampId}-noise)`}
      >
        <circle cx="60" cy="60" r="54" />
        <circle cx="60" cy="60" r="48" />
      </g>
      <g filter={`url(#${stampId}-noise)`}>
        <text
          fill={color}
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: "8px",
            letterSpacing: "0.18em",
          }}
        >
          <textPath href={`#${circlePathId}`} startOffset="0">
            {label.repeat(2)}
          </textPath>
        </text>
        <text
          x="60"
          y="68"
          textAnchor="middle"
          fill={color}
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontSize: "44px",
            fontStyle: "italic",
          }}
        >
          Q
        </text>
        <text
          x="60"
          y="86"
          textAnchor="middle"
          fill={color}
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: "7px",
            letterSpacing: "0.22em",
          }}
        >
          EST · 2026
        </text>
      </g>
    </svg>
  );
}
