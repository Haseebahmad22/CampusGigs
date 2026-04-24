"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Search, ShieldCheck, Star } from "lucide-react";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const navLinks = [
  { label: "Browse Gigs", href: "/signin" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-245">
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13.5px] text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
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
        </motion.nav>
      </div>

      {/* Hero */}
      <main className="relative max-w-6xl mx-auto px-6 sm:px-8">
        {/* Ambient gradient blobs */}
        <div className="pointer-events-none absolute -top-32 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07] bg-primary blur-[120px]" />
        <div className="pointer-events-none absolute top-20 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.05] bg-secondary blur-[100px]" />

        <section className="pt-36 sm:pt-44 pb-20 sm:pb-28 text-center">
          <motion.div {...fade(0.15)}>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs text-muted tracking-wide uppercase shadow-sm">
              <Zap className="w-3 h-3 text-primary" />
              Campus freelance marketplace
            </span>
          </motion.div>

          <motion.h1
            {...fade(0.25)}
            className="mt-7 text-[2.8rem] sm:text-[4rem] lg:text-[5rem] leading-[1.02] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Where campus talent
            <br />
            <span className="text-primary">meets opportunity.</span>
          </motion.h1>

          <motion.p
            {...fade(0.35)}
            className="mt-5 text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed"
          >
            Hire verified student freelancers. Build real experience.
            A clean, focused workflow from discovery to delivery.
          </motion.p>

          <motion.div
            {...fade(0.45)}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/15"
            >
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/how-it-works"
              className="px-7 py-3.5 rounded-lg border border-border bg-surface text-sm font-semibold text-foreground hover:bg-surface-elevated transition-colors"
            >
              How it works
            </Link>
          </motion.div>
        </section>

        {/* How it works — visual steps */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
          className="pb-24 sm:pb-32"
        >
          <motion.p
            {...fade()}
            className="text-center text-xs uppercase tracking-[0.14em] text-muted mb-10"
          >
            Simple by design
          </motion.p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Post or discover",
                desc: "Clients post gigs with clear scopes. Freelancers browse and apply with proposals.",
                icon: Search,
                color: "primary",
              },
              {
                step: "02",
                title: "Match & collaborate",
                desc: "Review profiles, accept proposals, and work together with full transparency.",
                icon: ShieldCheck,
                color: "secondary",
              },
              {
                step: "03",
                title: "Deliver & review",
                desc: "Mark work complete, confirm delivery, and leave honest reviews to build reputation.",
                icon: Star,
                color: "accent",
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                {...fade()}
                className="group relative rounded-xl border border-border bg-surface p-6 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04] transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-lg bg-${item.color}/8 border border-${item.color}/15 flex items-center justify-center`}>
                    <item.icon className={`w-4 h-4 text-${item.color}`} />
                  </div>
                  <span className="text-xs font-mono text-muted">{item.step}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Value props — marquee-style cards */}
        <motion.section
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-60px" }}
          className="pb-24 sm:pb-32"
        >
          <motion.div {...fade()} className="text-center mb-10">
            <h2
              className="text-2xl sm:text-3xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Built for campus ecosystems
            </h2>
            <p className="text-sm text-muted mt-2 max-w-md mx-auto">
              Purpose-built features that make freelancing work within a university context.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "Verified student profiles",
                desc: "University, department, and semester data ensures you're hiring real students with real context.",
              },
              {
                title: "Transparent reviews",
                desc: "Every completed gig can be reviewed. Ratings build reputation over time — no shortcuts.",
              },
              {
                title: "Proposal-based hiring",
                desc: "Clients choose from proposals, not first-come-first-served. Quality matches over speed.",
              },
              {
                title: "Token-based economy",
                desc: "A clean, internal token system designed for campus-scale transactions. No payment friction.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...fade(i * 0.06)}
                className="rounded-xl border border-border bg-surface p-5 hover:bg-surface-elevated transition-colors duration-200"
              >
                <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="pb-20 sm:pb-28"
        >
          <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.06] bg-primary blur-[80px]" />
            <h2
              className="text-2xl sm:text-3xl font-semibold tracking-tight relative"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to start?
            </h2>
            <p className="text-sm text-muted mt-2 max-w-sm mx-auto relative">
              Join the marketplace built for students, by students. Post your first gig or find your next opportunity.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 relative">
              <Link
                href="/signup"
                className="group flex items-center gap-2 px-7 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all"
              >
                Create account
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/signin"
                className="px-7 py-3 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-surface-elevated transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.section>
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
