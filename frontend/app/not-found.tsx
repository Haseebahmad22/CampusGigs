"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[55%_1fr] bg-background">
      {/* ── Left — visual panel ── */}
      <div className="hidden lg:flex items-stretch p-5">
        <div className="relative flex-1 rounded-[2.5rem] overflow-hidden">
          {/* Base gradient — deep forest / teal tones */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, #020c0a 0%, #051a14 15%, #0a2e22 30%, #083325 45%, #0d2e28 60%, #061e1a 75%, #030f0d 100%)",
            }}
          />

          {/* Layered depth gradients */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(16,185,129,0.18) 0%, transparent 70%)",
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(34,211,238,0.1) 0%, transparent 70%)",
            }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute top-0 left-0 right-0 h-1/2"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)",
            }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />

          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Abstract stylized "landscape" shapes */}
          {/* Far mountains */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[55%] opacity-30"
            style={{
              background:
                "linear-gradient(to top, rgba(10,40,32,0.9) 0%, transparent 100%)",
              clipPath: "polygon(0 100%, 0 55%, 15% 30%, 30% 50%, 50% 20%, 70% 45%, 85% 25%, 100% 40%, 100% 100%)",
            }}
          />
          {/* Near trees silhouette */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[65%] opacity-60"
            style={{
              background:
                "linear-gradient(to top, rgba(4,20,14,1) 0%, rgba(6,28,20,0.6) 30%, transparent 100%)",
              clipPath:
                "polygon(0 100%, 0 80%, 5% 55%, 8% 80%, 12% 40%, 15% 65%, 20% 30%, 24% 60%, 30% 45%, 33% 70%, 38% 35%, 42% 65%, 48% 50%, 52% 70%, 58% 40%, 62% 65%, 68% 30%, 72% 55%, 78% 38%, 82% 62%, 88% 42%, 92% 68%, 96% 50%, 100% 72%, 100% 100%)",
            }}
          />
          {/* Ground / foreground */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[22%]"
            style={{
              background:
                "linear-gradient(to top, rgba(2,10,7,1) 0%, transparent 100%)",
            }}
          />

          {/* Bottom text */}
          <div className="absolute bottom-0 left-0 right-0 p-9 pb-10">
            <p className="text-white/35 text-xs tracking-widest uppercase mb-2">
              Lost in the wild
            </p>
            <h2
              className="text-white/80 text-2xl leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              This path doesn&apos;t exist.
            </h2>
          </div>
        </div>
      </div>

      {/* ── Right — text panel ── */}
      <div className="flex flex-col justify-between p-10 lg:p-14 min-h-screen lg:min-h-0">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-foreground tracking-tight">
            CampusGigs
          </span>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-6 max-w-sm"
        >
          <div className="space-y-4">
            <h1
              className="text-[3rem] leading-[1.05] text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Oops! You&apos;ve found the lost world.
            </h1>
            <p className="text-muted text-sm leading-relaxed">
              Home is just a click away. Let&apos;s go back and continue.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground border-b border-foreground/30 hover:border-primary hover:text-primary transition-all pb-0.5 tracking-wide uppercase"
          >
            Go to Home
          </Link>
        </motion.div>

        {/* Error code */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-subtle text-xs"
        >
          Error code #404
        </motion.p>
      </div>
    </div>
  );
}
