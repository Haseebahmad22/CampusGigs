"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Users,
  CheckCircle,
  Star,
  Coins,
  ShieldCheck,
  Zap,
  Clock,
} from "lucide-react";
import { Stamp } from "@/components/ui/stamp";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 260, damping: 28, delay },
});

const navLinks = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

const STEPS = [
  {
    n: "01",
    Icon: Search,
    title: "Post or discover",
    body: "Clients post gigs with a clear scope and reward. Freelancers browse and apply with proposals — quality over speed.",
  },
  {
    n: "02",
    Icon: Users,
    title: "Match & collaborate",
    body: "Review profiles, accept the right proposal, exchange files and messages in one place. Scope stays tied to the gig.",
  },
  {
    n: "03",
    Icon: CheckCircle,
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
    bg: "V",
    Icon: ShieldCheck,
  },
  {
    kicker: "Trust",
    title: "Reviews that compound.",
    body: "Every completed gig can be reviewed. Ratings build over time — no shortcuts, no fake reputation.",
    span: "md:col-span-5",
    bg: "★",
    Icon: Star,
  },
  {
    kicker: "Hiring",
    title: "Proposal-based, not first-come.",
    body: "Clients choose from proposals. Freelancers compete on craft, not on refresh speed.",
    span: "md:col-span-5",
    bg: "P",
    Icon: Zap,
  },
  {
    kicker: "Tokens",
    title: "Built for campus-scale work.",
    body: "An internal token economy designed for student-to-student transactions. No payment friction, no card setup.",
    span: "md:col-span-7",
    bg: "T",
    Icon: Coins,
  },
];

const STATS = [
  { value: "500+", label: "Students" },
  { value: "1,200+", label: "Gigs posted" },
  { value: "4.9★", label: "Avg rating" },
];

const SKILLS = [
  "Design",
  "Development",
  "Writing",
  "Marketing",
  "Video Editing",
  "Research",
  "Translation",
  "Data Analysis",
  "Photography",
  "Social Media",
  "Illustration",
  "Motion Graphics",
  "Copywriting",
  "Branding",
  "UI/UX",
  "3D Modelling",
];

const MOCK_GIGS = [
  {
    title: "Design a pitch deck for startup demo day",
    tags: ["Figma", "Branding"],
    tokens: 120,
    client: "Riya M.",
    clientInitial: "R",
    proposals: 4,
    time: "2h ago",
  },
  {
    title: "Build a REST API for final year project",
    tags: ["Node.js", "PostgreSQL"],
    tokens: 200,
    client: "Hamza K.",
    clientInitial: "H",
    proposals: 7,
    time: "5h ago",
  },
];

function MockGigCard({
  gig,
  style,
}: {
  gig: (typeof MOCK_GIGS)[0];
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="rounded-md border border-border bg-surface"
      style={{
        boxShadow: "0 4px 24px rgba(26,24,20,0.10), 0 1px 4px rgba(26,24,20,0.06)",
        ...style,
      }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--color-success)" }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
              Open
            </span>
          </span>
          <span className="font-mono tabular-nums text-[13px] font-medium text-accent">
            {gig.tokens} tok
          </span>
        </div>

        <p className="mt-3 font-serif text-[16px] leading-snug text-foreground">
          {gig.title}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {gig.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded border border-border bg-surface-elevated font-mono text-[9px] uppercase tracking-[0.14em] text-subtle"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
              style={{ background: "rgba(31,77,63,0.12)" }}
            >
              <span className="font-mono text-[8px] font-medium text-primary">
                {gig.clientInitial}
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-subtle truncate">
              {gig.client}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-subtle tabular-nums">
              {gig.proposals} proposals
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-subtle flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {gig.time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const marqueeSkills = [...SKILLS, ...SKILLS];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 h-14 w-full border-b border-border bg-background/95 backdrop-blur-[2px]">
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
        {/* ── Hero ── */}
        <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-20">
          {/* Subtle dot grid background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(155,148,134,0.22) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage:
                "radial-gradient(ellipse 80% 70% at 60% 40%, black 30%, transparent 100%)",
            }}
          />

          <div className="grid grid-cols-12 gap-6 items-center">
            {/* Left: headline */}
            <div className="col-span-12 md:col-span-7 lg:col-span-6">
              <motion.div {...fade(0.05)}>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
                  Campus freelance marketplace · 2026
                </span>
                <h1 className="mt-5 font-serif text-[3.2rem] sm:text-[4.5rem] lg:text-[5.2rem] leading-[0.96] tracking-tight text-foreground">
                  Where campus
                  <br />
                  talent meets{" "}
                  <em className="italic text-primary">opportunity.</em>
                </h1>
              </motion.div>

              <motion.p
                {...fade(0.18)}
                className="mt-6 text-[17px] text-muted leading-relaxed max-w-[420px]"
              >
                Hire verified student freelancers. Build real experience. A
                clean, focused workflow from discovery to delivery — no
                recruiter, no middleman, no noise.
              </motion.p>

              <motion.div
                {...fade(0.28)}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
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
              </motion.div>

              <motion.div {...fade(0.38)} className="mt-10">
                <Stamp variant="seal" tone="terracotta" size={90} rotation={-8} />
              </motion.div>
            </div>

            {/* Right: floating mock gig cards */}
            <motion.div
              initial={{ opacity: 0, x: 32, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 28,
                delay: 0.35,
              }}
              className="hidden md:block col-span-5 lg:col-span-6"
            >
              <div className="relative h-[300px] lg:h-[320px]">
                {/* Back card */}
                <div
                  className="absolute top-10 left-6 right-0"
                  style={{ transform: "rotate(3deg)", opacity: 0.72 }}
                >
                  <MockGigCard gig={MOCK_GIGS[1]} />
                </div>
                {/* Front card */}
                <div
                  className="absolute top-0 left-0 right-6"
                  style={{ transform: "rotate(-1.5deg)" }}
                >
                  <MockGigCard gig={MOCK_GIGS[0]} />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-t border-b border-border py-6"
        >
          <div className="grid grid-cols-3 divide-x divide-border">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="px-4 sm:px-8 first:pl-0 last:pr-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3"
              >
                <span className="font-mono tabular-nums text-[1.6rem] sm:text-[2.2rem] leading-none text-foreground">
                  {stat.value}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-subtle">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Steps ── */}
        <section className="border-t border-border pt-16 pb-24">
          <div className="flex items-end justify-between gap-4 mb-14">
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

          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-border">
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
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
                    style={{ background: "rgba(31,77,63,0.1)" }}
                  >
                    <step.Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
                    {step.n}
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] text-muted leading-relaxed">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Marquee ── full bleed */}
      <div className="border-t border-b border-border py-3.5 overflow-hidden bg-surface-elevated">
        <div className="flex animate-marquee whitespace-nowrap">
          {marqueeSkills.map((skill, i) => (
            <span
              key={i}
              className="shrink-0 inline-flex items-center gap-4 mx-1"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
                {skill}
              </span>
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{ background: "var(--color-accent)", opacity: 0.5 }}
              />
            </span>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* ── Values bento ── */}
        <section className="border-t border-border pt-16 pb-24">
          <div className="mb-14">
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
                  delay: i * 0.06,
                }}
                className={`col-span-12 ${v.span} relative overflow-hidden rounded-md border border-border bg-surface p-7 md:p-9 hover:border-rule-strong transition-colors`}
              >
                {/* Large faint background letter */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -bottom-4 font-serif text-[9rem] leading-none select-none"
                  style={{ color: "rgba(31,77,63,0.06)" }}
                >
                  {v.bg}
                </span>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
                      style={{ background: "rgba(232,116,60,0.1)" }}
                    >
                      <v.Icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                      {v.kicker}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-[15px] text-muted leading-relaxed max-w-md">
                    {v.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* ── CTA — full bleed dark block ── */}
      <section
        style={{ background: "var(--color-primary)" }}
        className="relative overflow-hidden"
      >
        {/* Dot grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(247,244,236,0.07) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-12 gap-6 items-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="col-span-12 md:col-span-8"
            >
              <span
                className="block font-mono text-[10px] uppercase tracking-[0.22em] mb-4"
                style={{ color: "rgba(247,244,236,0.5)" }}
              >
                Ready to start
              </span>
              <h2
                className="font-serif text-[2.8rem] sm:text-[4rem] lg:text-[4.5rem] leading-[0.97] tracking-tight"
                style={{ color: "#F7F4EC" }}
              >
                Your next project
                <br />
                is <em className="italic" style={{ color: "var(--color-accent-light)" }}>one gig away.</em>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 240, damping: 28, delay: 0.1 }}
              className="col-span-12 md:col-span-4 flex flex-wrap gap-3 md:justify-end"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium text-[14px] transition-colors"
                style={{
                  background: "#F7F4EC",
                  color: "var(--color-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-accent-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F7F4EC";
                }}
              >
                Create account
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center px-6 py-3 rounded-md text-[14px] font-medium transition-colors"
                style={{
                  border: "1px solid rgba(247,244,236,0.25)",
                  color: "rgba(247,244,236,0.85)",
                }}
              >
                Sign in
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
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
