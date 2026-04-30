"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Stamp } from "@/components/ui/stamp";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    type: "spring" as const,
    stiffness: 260,
    damping: 28,
    delay,
  },
});

const CLIENT_STEPS = [
  {
    n: "01",
    title: "Post a gig",
    body: "Describe the work, set a token reward, attach reference files. Your gig is visible to every student on the platform within seconds.",
  },
  {
    n: "02",
    title: "Review proposals",
    body: "Freelancers send proposals with cover letters and rates. Browse profiles, ratings, and prior work — pick on craft, not refresh speed.",
  },
  {
    n: "03",
    title: "Confirm delivery",
    body: "Once the freelancer submits, review the deliverables. Confirm completion and tokens transfer automatically.",
  },
  {
    n: "04",
    title: "Leave a review",
    body: "Rate the freelancer, leave honest feedback. Reviews compound into the reputation that makes the whole marketplace work.",
  },
];

const FREELANCER_STEPS = [
  {
    n: "01",
    title: "Browse open gigs",
    body: "Filter by skill, reward, or recency. The feed reflects real work being posted right now on your campus.",
  },
  {
    n: "02",
    title: "Submit a proposal",
    body: "Write a focused cover letter. One proposal per gig — make it specific to the brief, not a template.",
  },
  {
    n: "03",
    title: "Do the work",
    body: "Once accepted, message the client, share files, mark complete. Scope and deliverables stay tied to the gig — never chasing email.",
  },
  {
    n: "04",
    title: "Build your reputation",
    body: "Every closed gig earns tokens and a review. Your profile grows into verified, real-world work history.",
  },
];

const navLinks = [
  { label: "How it works", href: "/how-it-works", active: true },
  { label: "Pricing", href: "/pricing", active: false },
];

function StepRow({
  n,
  title,
  body,
  delay,
}: {
  n: string;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <motion.div
      {...fade(delay)}
      className="grid grid-cols-12 gap-6 border-b border-rule py-8 last:border-b-0"
    >
      <div className="col-span-12 md:col-span-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
          {n}
        </span>
      </div>
      <div className="col-span-12 md:col-span-10">
        <h3 className="font-serif text-2xl md:text-3xl text-foreground">
          {title}
        </h3>
        <p className="mt-3 text-[15px] text-muted leading-relaxed max-w-2xl">
          {body}
        </p>
      </div>
    </motion.div>
  );
}

export default function HowItWorksPage() {
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
                className={`text-[14px] py-4 -mb-px border-b-2 transition-colors ${
                  link.active
                    ? "text-foreground border-primary"
                    : "text-muted hover:text-foreground border-transparent"
                }`}
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

      <main className="mx-auto max-w-6xl px-5 sm:px-8 pt-16 pb-24">
        {/* Header */}
        <section className="grid grid-cols-12 gap-6 items-end pb-16 border-b border-rule">
          <div className="col-span-12 md:col-span-9">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
              How it works
            </span>
            <h1 className="mt-5 font-serif text-[3rem] sm:text-[4rem] leading-[1] tracking-tight text-foreground">
              From posting to payment,
              <br />
              <em className="italic text-primary">in four simple steps.</em>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] text-muted leading-relaxed">
              Hiring or freelancing — the flow is the same shape. Fast,
              transparent, fair. No recruiters, no hidden fees, no platform
              tax.
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end">
            <Stamp variant="seal" tone="terracotta" size={120} rotation={-8} />
          </div>
        </section>

        {/* For clients */}
        <section className="pt-16">
          <div className="flex items-end justify-between gap-4 mb-4 pb-3 border-b border-rule">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-subtle mb-1.5">
                Section I
              </span>
              <h2 className="font-serif text-3xl text-foreground">For clients</h2>
            </div>
            <span className="hidden md:block font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
              Hire student talent
            </span>
          </div>
          {CLIENT_STEPS.map((step, i) => (
            <StepRow key={step.n} {...step} delay={i * 0.06} />
          ))}
        </section>

        {/* For freelancers */}
        <section className="pt-16">
          <div className="flex items-end justify-between gap-4 mb-4 pb-3 border-b border-rule">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-subtle mb-1.5">
                Section II
              </span>
              <h2 className="font-serif text-3xl text-foreground">
                For freelancers
              </h2>
            </div>
            <span className="hidden md:block font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
              Build your campus reputation
            </span>
          </div>
          {FREELANCER_STEPS.map((step, i) => (
            <StepRow key={step.n} {...step} delay={i * 0.06} />
          ))}
        </section>

        {/* CTA */}
        <section className="border-t border-rule mt-16 pt-16">
          <div className="grid grid-cols-12 gap-6 items-center">
            <h2 className="col-span-12 md:col-span-8 font-serif text-3xl md:text-5xl tracking-tight text-foreground">
              Ready to jump in?
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
