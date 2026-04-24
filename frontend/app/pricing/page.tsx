"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check, Coins, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const plans = [
  {
    name: "Starter",
    icon: Coins,
    price: "Free",
    priceNote: "to get started",
    description: "Perfect for trying out the platform and posting your first gigs.",
    color: "primary",
    featured: false,
    tokens: "50 tokens",
    features: [
      "50 tokens on signup",
      "Post up to 3 active gigs",
      "Browse all freelancer profiles",
      "Basic proposal management",
      "Review and rating system",
    ],
  },
  {
    name: "Pro",
    icon: Zap,
    price: "500",
    priceNote: "tokens / semester",
    description: "For active clients who hire regularly and want priority access.",
    color: "primary",
    featured: true,
    tokens: "500 tokens",
    features: [
      "500 tokens per semester",
      "Unlimited active gigs",
      "Priority listing in search",
      "Detailed proposal analytics",
      "Review and rating system",
      "Early access to new features",
    ],
  },
  {
    name: "Campus",
    icon: Crown,
    price: "Custom",
    priceNote: "for organizations",
    description: "For student organizations, departments, and campus-wide programs.",
    color: "accent",
    featured: false,
    tokens: "Custom allocation",
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

export default function PricingPage() {
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
            <Link href="/how-it-works" className="text-[13.5px] text-muted hover:text-foreground transition-colors">How it Works</Link>
            <Link href="/pricing" className="text-[13.5px] text-foreground font-medium">Pricing</Link>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/signin" className="text-[13.5px] text-muted hover:text-foreground transition-colors">Log in</Link>
            <Link href="/signup" className="text-[13.5px] font-semibold bg-primary text-white px-5 py-2 rounded-md hover:bg-primary-dark transition-colors">Sign up</Link>
          </div>
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 pt-36 sm:pt-44 pb-20">
        {/* Header */}
        <motion.div {...fade(0.1)} className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs text-muted tracking-wide uppercase">
            <Coins className="w-3 h-3 text-primary" />
            Token pricing
          </span>
          <h1
            className="mt-5 text-3xl sm:text-[2.8rem] leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simple, transparent
            <br />
            <span className="text-primary">token-based pricing.</span>
          </h1>
          <p className="mt-4 text-base text-muted max-w-lg mx-auto">
            CampusGigs runs on tokens — an internal currency designed for campus-scale transactions. No payment processors, no friction.
          </p>
        </motion.div>

        {/* Plans */}
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-40px" }}
          className="grid md:grid-cols-3 gap-4 mb-20"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              {...fade(i * 0.08)}
              className={cn(
                "relative rounded-xl border p-6 transition-all duration-200",
                plan.featured
                  ? "border-primary/30 bg-surface shadow-lg shadow-primary/[0.06] scale-[1.02]"
                  : "border-border bg-surface hover:border-primary/15"
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-semibold uppercase tracking-wider">
                    Most popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-9 h-9 rounded-lg bg-${plan.color}/8 border border-${plan.color}/15 flex items-center justify-center`}>
                  <plan.icon className={`w-4 h-4 text-${plan.color}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
              </div>

              <div className="mb-3">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                {plan.price !== "Free" && plan.price !== "Custom" && (
                  <span className="text-xs text-muted ml-1">tokens</span>
                )}
                <p className="text-xs text-muted mt-0.5">{plan.priceNote}</p>
              </div>

              <p className="text-sm text-muted leading-relaxed mb-5">{plan.description}</p>

              <div className="space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                    <span className="text-sm text-muted">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className={cn(
                  "block w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-colors",
                  plan.featured
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "border border-border text-foreground hover:bg-surface-elevated"
                )}
              >
                {plan.price === "Custom" ? "Contact us" : "Get started"}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* How tokens work */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <h2
            className="text-xl font-semibold text-foreground mb-6 text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How tokens work
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                title: "Clients spend tokens",
                desc: "When you post a gig, you set a token reward. Tokens transfer to the freelancer once you confirm delivery.",
              },
              {
                title: "Freelancers earn tokens",
                desc: "Complete gigs to earn tokens. Your total earnings and job count are displayed on your public profile.",
              },
              {
                title: "Tokens stay on-platform",
                desc: "Tokens are an internal currency for now. They represent work value and build your campus reputation.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
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
          <h2 className="text-xl font-semibold text-foreground">Start with 50 free tokens</h2>
          <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto">
            Every new account gets tokens to try the platform. No credit card required.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all"
            >
              Create free account <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
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
