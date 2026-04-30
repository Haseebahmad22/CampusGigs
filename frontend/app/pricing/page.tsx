"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    suffix: "to start",
    description:
      "Perfect for trying out the platform and posting your first gigs.",
    cta: "Get started",
    featured: false,
    features: [
      "50 tokens on signup",
      "Post up to 3 active gigs",
      "Browse all freelancer profiles",
      "Basic proposal management",
      "Review & rating system",
    ],
  },
  {
    name: "Pro",
    price: "500",
    suffix: "tokens / semester",
    description:
      "For active clients who hire regularly and want priority access.",
    cta: "Upgrade to Pro",
    featured: true,
    features: [
      "500 tokens per semester",
      "Unlimited active gigs",
      "Priority listing in search",
      "Detailed proposal analytics",
      "Review & rating system",
      "Early access to new features",
    ],
  },
  {
    name: "Campus",
    price: "Custom",
    suffix: "for organizations",
    description:
      "For student organizations, departments, and campus-wide programs.",
    cta: "Contact us",
    featured: false,
    features: [
      "Custom token allocation",
      "Unlimited active gigs",
      "Organization profile & branding",
      "Team member management",
      "Bulk gig posting",
      "Dedicated support",
    ],
  },
];

const TOKEN_FACTS = [
  {
    title: "Clients spend tokens.",
    body: "When you post a gig, you set a token reward. Tokens transfer to the freelancer once you confirm delivery.",
  },
  {
    title: "Freelancers earn tokens.",
    body: "Complete gigs to earn tokens. Your total earnings and job count are displayed on your public profile.",
  },
  {
    title: "Tokens stay on-platform.",
    body: "Tokens are an internal currency. They represent work value and build your campus reputation.",
  },
];

const navLinks = [
  { label: "How it works", href: "/how-it-works", active: false },
  { label: "Pricing", href: "/pricing", active: true },
];

export default function PricingPage() {
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
              Pricing · Token economy
            </span>
            <h1 className="mt-5 font-serif text-[3rem] sm:text-[4rem] leading-[1] tracking-tight text-foreground">
              Simple, transparent
              <br />
              <em className="italic text-primary">token-based pricing.</em>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] text-muted leading-relaxed">
              CampusGigs runs on tokens — an internal currency designed for
              campus-scale work. No payment processors, no hidden fees, no
              subscriptions for freelancers.
            </p>
          </div>
        </section>

        {/* Plans table */}
        <section className="pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-rule">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: i * 0.07,
                }}
                className={cn(
                  "relative px-0 md:px-8 py-8 first:md:pl-0 last:md:pr-0",
                  plan.featured &&
                    "md:bg-surface-elevated/40 border-l-2 border-l-accent"
                )}
              >
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                    {plan.name}
                  </span>
                  {plan.featured ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                      Recommended
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-serif tabular-nums text-6xl md:text-7xl text-foreground leading-none">
                    {plan.price}
                  </span>
                </div>
                <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                  {plan.suffix}
                </span>

                <p className="mt-6 text-[14px] text-muted leading-relaxed">
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-[14px]"
                    >
                      <Check className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
                      <span className="text-foreground/85">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={cn(
                    "mt-7 inline-flex w-full items-center justify-center px-5 py-3 rounded-md text-[14px] font-medium transition-colors",
                    plan.featured
                      ? "bg-primary text-[#F7F4EC] hover:bg-primary-dark"
                      : "border border-rule-strong text-foreground hover:bg-surface-elevated"
                  )}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How tokens work */}
        <section className="border-t border-rule mt-16 pt-16">
          <div className="mb-10 flex items-end justify-between gap-4 pb-3 border-b border-rule">
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-subtle mb-1.5">
                Mechanics
              </span>
              <h2 className="font-serif text-3xl text-foreground">
                How tokens work.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-rule">
            {TOKEN_FACTS.map((fact, i) => (
              <motion.div
                key={fact.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: i * 0.06,
                }}
                className="px-0 md:px-8 first:md:pl-0 last:md:pr-0 py-6"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-serif text-2xl text-foreground">
                  {fact.title}
                </h3>
                <p className="mt-3 text-[14px] text-muted leading-relaxed">
                  {fact.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-rule mt-16 pt-16">
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 md:col-span-8">
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-foreground">
                Start with 50 free tokens.
              </h2>
              <p className="mt-3 text-[15px] text-muted max-w-md">
                Every new account gets tokens to try the platform. No credit
                card, no commitment.
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-[#F7F4EC] font-medium text-[14px] hover:bg-primary-dark transition-colors"
              >
                Create account
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
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
