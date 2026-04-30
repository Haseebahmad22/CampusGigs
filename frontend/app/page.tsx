"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Stamp } from "@/components/ui/stamp";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: {
    type: "spring" as const,
    stiffness: 260,
    damping: 28,
    delay,
  },
});

const navLinks = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

const STEPS = [
  {
    n: "01",
    title: "Post or discover",
    body: "Clients post gigs with a clear scope and reward. Freelancers browse and apply with proposals — quality over speed.",
  },
  {
    n: "02",
    title: "Match & collaborate",
    body: "Review profiles, accept the right proposal, exchange files and messages in one place. Scope stays tied to the gig.",
  },
  {
    n: "03",
    title: "Deliver & review",
    body: "Mark work complete, confirm delivery, leave honest reviews. Reputation is built one gig at a time.",
  },
];

const VALUES = [
  {
    kicker: "Verified",
    title: "Real students. Real context.",
    body: "University, department, and semester data on every profile. No anonymous talent pool — you're hiring people you can find on campus tomorrow.",
    span: "md:col-span-7",
  },
  {
    kicker: "Trust",
    title: "Reviews that compound.",
    body: "Every completed gig can be reviewed. Ratings build over time — no shortcuts, no fake reputation.",
    span: "md:col-span-5",
  },
  {
    kicker: "Hiring",
    title: "Proposal-based, not first-come.",
    body: "Clients choose from proposals. Freelancers compete on craft, not on refresh speed.",
    span: "md:col-span-5",
  },
  {
    kicker: "Tokens",
    title: "Built for campus-scale work.",
    body: "An internal token economy designed for student-to-student transactions. No payment friction, no card setup.",
    span: "md:col-span-7",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 h-14 w-full border-b border-rule bg-background/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            href="/"
            className="font-serif italic text-[22px] leading-none text-foreground shrink-0"
          >
            CampusGigs
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[14px] text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="text-[14px] text-muted hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-medium bg-primary text-[#F7F4EC] px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Hero */}
        <section className="relative pt-20 pb-28 sm:pt-28 sm:pb-32">
          <div className="grid grid-cols-12 gap-6 items-end">
            <motion.div {...fade(0.05)} className="col-span-12 md:col-span-9">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
                Campus freelance marketplace · 2026
              </span>
              <h1 className="mt-5 font-serif text-[3.2rem] sm:text-[4.5rem] lg:text-[5.5rem] leading-[0.98] tracking-tight text-foreground">
                Where campus
                <br />
                talent meets <em className="italic text-primary">opportunity.</em>
              </h1>
            </motion.div>
            <motion.div
              {...fade(0.2)}
              className="col-span-12 md:col-span-3 flex md:justify-end"
            >
              <Stamp variant="seal" tone="terracotta" size={120} rotation={-8} />
            </motion.div>
          </div>

          <motion.div
            {...fade(0.3)}
            className="mt-10 grid grid-cols-12 gap-6 items-end"
          >
            <p className="col-span-12 md:col-span-7 text-[17px] text-muted leading-relaxed max-w-xl">
              Hire verified student freelancers. Build real experience. A clean,
              focused workflow from discovery to delivery — no recruiter, no
              middleman, no noise.
            </p>
            <div className="col-span-12 md:col-span-5 flex flex-wrap items-center gap-3 md:justify-end">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-[#F7F4EC] font-medium text-[14px] hover:bg-primary-dark transition-colors"
              >
                Get started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center px-6 py-3 rounded-md border border-rule-strong text-[14px] font-medium text-foreground hover:bg-surface-elevated transition-colors"
              >
                How it works
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Steps */}
        <section className="border-t border-rule pt-16 pb-24">
          <div className="flex items-end justify-between gap-4 mb-12">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-subtle mb-2">
                The flow
              </span>
              <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground">
                Simple by design.
              </h2>
            </div>
            <span className="hidden md:block font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
              Three steps · no surprises
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-rule">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: i * 0.08,
                }}
                className="px-0 md:px-8 first:md:pl-0 py-6 md:py-2"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
                  {step.n}
                </span>
                <h3 className="mt-3 font-serif text-2xl text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] text-muted leading-relaxed">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values bento */}
        <section className="border-t border-rule pt-16 pb-24">
          <div className="mb-12">
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-subtle mb-2">
              Why CampusGigs
            </span>
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground max-w-xl">
              Built for the way students actually work.
            </h2>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: i * 0.05,
                }}
                className={`col-span-12 ${v.span} rounded-md border border-border bg-surface p-6 md:p-8 hover:border-rule-strong transition-colors`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                  {v.kicker}
                </span>
                <h3 className="mt-3 font-serif text-2xl text-foreground">
                  {v.title}
                </h3>
                <p className="mt-3 text-[15px] text-muted leading-relaxed max-w-md">
                  {v.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-rule py-20">
          <div className="grid grid-cols-12 gap-6 items-center">
            <h2 className="col-span-12 md:col-span-8 font-serif text-3xl md:text-5xl tracking-tight text-foreground">
              Ready to start?
            </h2>
            <div className="col-span-12 md:col-span-4 flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-[#F7F4EC] font-medium text-[14px] hover:bg-primary-dark transition-colors"
              >
                Create account
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center px-6 py-3 rounded-md border border-rule-strong text-[14px] font-medium text-foreground hover:bg-surface-elevated transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule py-8">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
          <span>&copy; {new Date().getFullYear()} CampusGigs</span>
          <div className="flex items-center gap-6">
            <Link
              href="/how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              className="hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
