"use client";

import { motion } from "framer-motion";
import { Stamp } from "@/components/ui/stamp";

interface Props {
  kicker?: string;
  headline?: string;
  emphasis?: string;
}

const QUOTES = [
  {
    body: "I posted a poster design gig on a Tuesday. By Friday I'd shipped it, paid in tokens, and left a review.",
    by: "Mira K.",
    role: "CS · Sem 5 · Client",
  },
  {
    body: "Three gigs in two months — built a portfolio that actually got me an internship interview.",
    by: "Adi R.",
    role: "Design · Sem 6 · Freelancer",
  },
  {
    body: "It feels like a campus bulletin board, but the work is real.",
    by: "Sana T.",
    role: "Business · Sem 4 · Client",
  },
];

export function AuthVisualPanel({
  kicker = "Campus talent platform",
  headline = "Where skills",
  emphasis = "meet opportunity.",
}: Props) {
  return (
    <div className="hidden lg:flex items-stretch p-5">
      <div className="relative flex-1 rounded-md border border-rule-strong bg-surface-elevated overflow-hidden">
        {/* Editorial collage layout */}
        <div className="absolute inset-0 p-12 flex flex-col">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
              {kicker}
            </span>
            <Stamp variant="seal" tone="terracotta" size={80} rotation={-6} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.1 }}
            className="mt-8"
          >
            <h2 className="font-serif text-[2.6rem] xl:text-[3.4rem] leading-[1] tracking-tight text-foreground">
              {headline}
              <br />
              <em className="italic text-primary">{emphasis}</em>
            </h2>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 gap-4">
            {QUOTES.map((q, i) => (
              <motion.div
                key={q.by}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: 0.25 + i * 0.08,
                }}
                className="border-t border-rule pt-4"
              >
                <p className="font-serif italic text-[15px] text-foreground leading-snug max-w-md">
                  &ldquo;{q.body}&rdquo;
                </p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-[13px] text-foreground">{q.by}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                    {q.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
