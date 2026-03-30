"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, FileText, Users, CheckCircle, Star, Briefcase, Coins,
} from "lucide-react";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const clientSteps = [
  {
    icon: FileText,
    title: "Post a gig",
    desc: "Describe the work, set a token budget, and publish. Your gig is immediately visible to all freelancers on the platform.",
  },
  {
    icon: Users,
    title: "Review proposals",
    desc: "Freelancers submit proposals with cover letters. Browse their profiles, check ratings and completed work, then pick the best fit.",
  },
  {
    icon: CheckCircle,
    title: "Confirm delivery",
    desc: "Once the freelancer submits their work, review it and confirm completion. Tokens transfer and the gig is closed.",
  },
  {
    icon: Star,
    title: "Leave a review",
    desc: "Rate the freelancer and leave feedback. Reviews build the reputation layer that makes the whole platform work.",
  },
];

const freelancerSteps = [
  {
    icon: Briefcase,
    title: "Browse open gigs",
    desc: "Search and filter gigs by keyword, reward, or recency. Find work that matches your skills and availability.",
  },
  {
    icon: FileText,
    title: "Submit a proposal",
    desc: "Write a cover letter explaining why you're the right fit. One proposal per gig — make it count.",
  },
  {
    icon: Coins,
    title: "Do the work",
    desc: "Once accepted, complete the gig and mark it as done. The client reviews your submission and confirms delivery.",
  },
  {
    icon: Star,
    title: "Build your reputation",
    desc: "Every completed gig earns you tokens and a review. Your profile grows with real, verified work history.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-245">
        <nav
          className="h-16 rounded-2xl flex items-center justify-between px-6 sm:px-7 gap-6"
          style={{
            background: "rgba(255,255,255,0.86)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
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
            <Link href="/signin" className="text-[13.5px] text-muted hover:text-foreground transition-colors">Browse Gigs</Link>
            <Link href="/how-it-works" className="text-[13.5px] text-foreground font-medium">How it Works</Link>
            <Link href="/pricing" className="text-[13.5px] text-muted hover:text-foreground transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/signin" className="text-[13.5px] text-muted hover:text-foreground transition-colors">Log in</Link>
            <Link href="/signup" className="text-[13.5px] font-semibold bg-primary text-white px-5 py-2 rounded-md hover:bg-primary-dark transition-colors">Sign up</Link>
          </div>
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 pt-36 sm:pt-44 pb-20">
        {/* Header */}
        <motion.div {...fade(0.1)} className="text-center mb-16">
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs text-muted tracking-wide uppercase">
            How it works
          </span>
          <h1
            className="mt-5 text-3xl sm:text-[2.8rem] leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            From posting to payment,
            <br />
            <span className="text-primary">in four simple steps.</span>
          </h1>
          <p className="mt-4 text-base text-muted max-w-lg mx-auto">
            Whether you&apos;re hiring or freelancing, the flow is designed to be fast, transparent, and fair.
          </p>
        </motion.div>

        {/* For Clients */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-20"
        >
          <motion.h2 {...fade()} className="text-lg font-semibold text-foreground mb-6">
            For clients
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {clientSteps.map((step, i) => (
              <motion.div
                key={step.title}
                {...fade(i * 0.06)}
                className="relative rounded-xl border border-border bg-surface p-5 hover:border-primary/20 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[11px] font-mono text-muted uppercase tracking-wider">Step {i + 1}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* For Freelancers */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-20"
        >
          <motion.h2 {...fade()} className="text-lg font-semibold text-foreground mb-6">
            For freelancers
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {freelancerSteps.map((step, i) => (
              <motion.div
                key={step.title}
                {...fade(i * 0.06)}
                className="relative rounded-xl border border-border bg-surface p-5 hover:border-secondary/20 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary/8 border border-secondary/15 flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-[11px] font-mono text-muted uppercase tracking-wider">Step {i + 1}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-surface p-8 sm:p-10 text-center"
        >
          <h2 className="text-xl font-semibold text-foreground">Ready to jump in?</h2>
          <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto">Create an account and start in under a minute.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all"
            >
              Sign up free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/signin" className="px-6 py-3 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-surface-elevated transition-colors">
              Log in
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="py-6 text-center text-xs text-subtle border-t border-border/80">
        <div className="flex items-center justify-center gap-6">
          <span>&copy; {new Date().getFullYear()} CampusGigs</span>
          <Link href="/how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        </div>
      </footer>
    </div>
  );
}
