"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[52%_1fr] bg-background">
      <div className="hidden lg:flex items-stretch p-5">
        <div className="relative flex-1 rounded-[2.5rem] overflow-hidden border border-border bg-surface shadow-[0_8px_24px_rgba(7,10,18,0.22)]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(140deg, #1f2638 0%, #263044 48%, #2b3550 100%)",
            }}
          />

          <motion.div
            className="absolute -top-28 -right-24 w-96 h-96 rounded-full"
            style={{ background: "rgba(20,184,166,0.14)" }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full"
            style={{ background: "rgba(14,165,233,0.12)" }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <div className="absolute inset-0 p-10 flex flex-col justify-between">
            <div className="w-fit rounded-full border border-border bg-surface/70 px-3 py-1 text-xs uppercase tracking-widest text-muted">
              404 Not Found
            </div>

            <div>
              <p className="text-muted text-xs tracking-widest uppercase mb-2">CampusGigs</p>
              <h2
                className="text-foreground text-2xl leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                The page you requested
                <br />
                is no longer here.
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between p-10 lg:p-14 min-h-screen lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="text-[19px] text-foreground italic"
            style={{ fontFamily: "var(--font-logo)" }}
          >
            CampusGigs
          </Link>
        </motion.div>

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
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-border bg-surface text-sm font-semibold text-foreground hover:bg-surface-elevated transition-colors"
          >
            Go to Home
          </Link>
        </motion.div>

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
