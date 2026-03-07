"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Floating island navbar ── */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-[920px]">
        <nav
          className="h-[64px] rounded-2xl flex items-center justify-between px-7 gap-6"
          style={{
            background: "rgba(12,12,21,0.70)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="text-[19px] text-white shrink-0 italic"
            style={{ fontFamily: "var(--font-logo)" }}
          >
            CampusGigs
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-8">
            {["Browse Gigs", "How it Works", "Pricing"].map((label) => (
              <span
                key={label}
                className="text-[13.5px] text-white/45 hover:text-white/85 transition-colors cursor-pointer"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-5 shrink-0">
            <Link
              href="/signin"
              className="text-[13.5px] text-white/50 hover:text-white/85 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-[13.5px] font-semibold bg-primary text-white px-5 py-2 rounded-xl hover:bg-primary-dark transition-colors"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </div>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse, rgba(139,92,246,0.22) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-[-5%] w-[400px] h-[400px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-3xl space-y-6"
        >
          <h1
            className="text-[3.8rem] sm:text-[5.5rem] leading-[1.05] text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Gigs for students,
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              by students.
            </span>
          </h1>

          <p className="text-lg text-muted max-w-md mx-auto">
            Post gigs, earn tokens, build your campus reputation.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-all shadow-lg active:scale-[0.98]"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signin"
              className="px-7 py-3.5 rounded-full border border-white/10 text-sm font-medium text-white/60 hover:text-white/90 hover:border-white/20 transition-all"
            >
              Log in
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="py-6 text-center text-xs text-subtle relative z-10">
        &copy; {new Date().getFullYear()} CampusGigs
      </footer>
    </div>
  );
}
