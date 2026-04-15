"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-245">
        <nav
          className="h-16 rounded-2xl flex items-center justify-between px-6 sm:px-7 gap-6"
          style={{
            background: "rgba(38,48,68,0.88)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 28px rgba(7,10,18,0.26)",
          }}
        >
          <Link
            href="/"
            className="text-[19px] text-foreground shrink-0 italic"
            style={{ fontFamily: "var(--font-logo)" }}
          >
            CampusGigs
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Browse Gigs", "How it Works", "Pricing"].map((label) => (
              <span
                key={label}
                className="text-[13.5px] text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/signin"
              className="text-[13.5px] text-muted hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-[13.5px] font-semibold bg-primary text-white px-5 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-6 sm:px-8 pt-32 pb-16 sm:pt-36 sm:pb-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] items-start gap-8 lg:gap-12">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-6"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted tracking-wide uppercase">
              Campus freelance marketplace
            </span>

            <h1
              className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4.1rem] leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Trusted student talent,
              <br />
              ready for real work.
            </h1>

            <p className="text-[1.03rem] text-muted max-w-xl leading-relaxed">
              CampusGigs helps clients hire verified student freelancers and helps students build meaningful professional experience.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/signup"
                className="flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signin"
                className="px-6 py-3 rounded-md border border-border bg-surface text-sm font-semibold text-foreground hover:bg-surface-elevated transition-colors"
              >
                Log in
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-5">
              {[
                "Verified student profiles",
                "Transparent rates and reviews",
                "Fast matching by skills",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-3 shadow-[0_8px_24px_rgba(7,10,18,0.22)]"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-[0_8px_24px_rgba(7,10,18,0.22)]"
          >
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Platform Snapshot</p>
                <h2 className="text-2xl mt-2 font-semibold">Structured hiring, human experience.</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Active freelancers", value: "2.4k+" },
                  { label: "Jobs completed", value: "8.9k" },
                  { label: "Avg response", value: "2.1h" },
                  { label: "Repeat clients", value: "71%" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-xs text-muted">{stat.label}</p>
                    <p className="text-xl font-semibold mt-1 text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-surface-elevated px-4 py-3.5">
                <p className="text-xs text-muted">Why teams choose CampusGigs</p>
                <p className="text-sm leading-relaxed text-foreground mt-1.5">
                  Purpose-built for campus ecosystems with profile quality controls, focused search, and a clean workflow from discovery to delivery.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-subtle border-t border-border/80">
        &copy; {new Date().getFullYear()} CampusGigs
      </footer>
    </div>
  );
}
