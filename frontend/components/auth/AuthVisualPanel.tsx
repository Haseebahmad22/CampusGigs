"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Props {
  imageSrc?: string;
}

export function AuthVisualPanel({ imageSrc }: Props) {
  return (
    <div className="hidden lg:flex items-stretch p-5">
      <div className="relative flex-1 rounded-[2.5rem] overflow-hidden">

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
                "linear-gradient(155deg, #0d0621 0%, #1e0a4a 18%, #2d1265 35%, #1b1e6e 52%, #0e2d5c 68%, #072340 82%, #030d1a 100%)",
            }}
          />
        )}

        {/* Dark overlay so text stays readable over any photo */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Subtle violet tint on top of photo */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 80% 20%, rgba(139,92,246,0.25) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bottom fade to dark for text legibility */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2/5 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
          }}
        />

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-9 pb-10">
          <p className="text-white/40 text-xs tracking-widest uppercase mb-2">
            Campus Talent Platform
          </p>
          <h2
            className="text-white text-3xl xl:text-4xl leading-tight"
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
