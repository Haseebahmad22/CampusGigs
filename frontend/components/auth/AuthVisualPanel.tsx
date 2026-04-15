"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Props {
  imageSrc?: string;
}

export function AuthVisualPanel({ imageSrc }: Props) {
  return (
    <div className="hidden lg:flex items-stretch p-5">
      <div className="relative flex-1 rounded-[2.5rem] overflow-hidden border border-border shadow-[0_10px_28px_rgba(7,10,18,0.24)]">

        {/* Background image or gradient fallback */}
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(150deg, #1f2638 0%, #263044 45%, #2b3550 100%)",
            }}
          />
        )}

        {/* Soft overlay to keep text readable over any photo */}
        <div className="absolute inset-0 bg-background/45" />

        {/* Subtle accent tint */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 80% 18%, rgba(20,184,166,0.24) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bottom fade for text legibility */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2/5 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(28,33,48,0.94) 0%, transparent 100%)",
          }}
        />

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-9 pb-10">
          <p className="text-muted text-xs tracking-widest uppercase mb-2">
            Campus Talent Platform
          </p>
          <h2
            className="text-foreground text-3xl xl:text-4xl leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Where skills meet
            <br />
            opportunity.
          </h2>
        </div>

      </div>
    </div>
  );
}
