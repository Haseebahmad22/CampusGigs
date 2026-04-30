"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonRow } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Gig, GigStatus } from "@/lib/types";

type StatusFilter =
  | "all"
  | "open"
  | "in_progress"
  | "pending_completion"
  | "closed";

const FILTERS: {
  id: StatusFilter;
  label: string;
  match: (g: Gig) => boolean;
}[] = [
  { id: "all", label: "All", match: () => true },
  { id: "open", label: "Open", match: (g) => g.status === "open" },
  {
    id: "in_progress",
    label: "Active",
    match: (g) => g.status === "in_progress",
  },
  {
    id: "pending_completion",
    label: "Pending",
    match: (g) => g.status === "pending_completion",
  },
  { id: "closed", label: "Completed", match: (g) => g.status === "closed" },
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const statusConfig: Record<
  GigStatus,
  {
    label: string;
    variant: "primary" | "secondary" | "warning" | "success" | "error";
  }
> = {
  open: { label: "Open", variant: "primary" },
  in_progress: { label: "In Progress", variant: "secondary" },
  pending_completion: { label: "Pending", variant: "warning" },
  closed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

export default function ClientGigsPage() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filteredGigs = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    return f ? gigs.filter(f.match) : gigs;
  }, [gigs, filter]);

  const filterCounts = useMemo(() => {
    return FILTERS.reduce<Record<StatusFilter, number>>(
      (acc, f) => {
        acc[f.id] = gigs.filter(f.match).length;
        return acc;
      },
      { all: 0, open: 0, in_progress: 0, pending_completion: 0, closed: 0 }
    );
  }, [gigs]);

  useEffect(() => {
    const token = localStorage.getItem("campusgigs_token");
    if (!token) {
      router.replace("/signin");
      return;
    }

    fetch(`${API}/api/gigs/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.data)) setGigs(data.data);
        else setError(data?.error || "Failed to load gigs.");
      })
      .catch(() => setError("Unable to connect to backend."))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 lg:py-14">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <SectionHeading
            title="My gigs"
            kicker="Client area"
            action={
              <Button onClick={() => router.push("/client/gigs/new")} variant="accent">
                <Plus className="w-4 h-4" />
                Post a gig
              </Button>
            }
          />
        </motion.section>

        {error && (
          <p className="mt-6 text-sm text-error">{error}</p>
        )}

        {/* Filter chips */}
        {!loading && gigs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                  filter === f.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-rule text-muted hover:text-foreground hover:border-rule-strong"
                )}
              >
                {f.label}
                <span className="tabular-nums opacity-70">
                  {String(filterCounts[f.id]).padStart(2, "0")}
                </span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && gigs.length === 0 && (
          <div className="mt-8">
            <EmptyState
              title="No gigs yet."
              description="Post your first gig to find campus talent."
              action={
                <Button
                  onClick={() => router.push("/client/gigs/new")}
                  variant="accent"
                >
                  <Plus className="w-4 h-4" /> Post a gig
                </Button>
              }
            />
          </div>
        )}

        {!loading && gigs.length > 0 && filteredGigs.length === 0 && (
          <div className="mt-8">
            <EmptyState
              title="Nothing in this filter."
              description="Try a different status, or clear the filter to see everything."
            />
          </div>
        )}

        {/* Newsprint table */}
        {!loading && filteredGigs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-8 border-t border-rule"
          >
            {filteredGigs.map((gig) => {
              const cfg = statusConfig[gig.status];
              return (
                <motion.button
                  key={gig.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 28,
                  }}
                  onClick={() => router.push(`/client/gigs/${gig.id}`)}
                  className="w-full text-left grid grid-cols-12 gap-4 items-center py-5 border-b border-rule hover:bg-surface-elevated transition-colors px-2 -mx-2 rounded-sm"
                >
                  <div className="col-span-12 md:col-span-7 min-w-0">
                    <p className="font-serif text-xl text-foreground truncate">
                      {gig.title}
                    </p>
                    <div className="mt-1 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                      {gig.freelancerName ? (
                        <span>Assigned · {gig.freelancerName}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {gig.pendingProposalCount} proposal
                          {gig.pendingProposalCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="tabular-nums">
                        {new Date(gig.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-6 md:col-span-3 text-left md:text-right">
                    <span className="font-serif tabular-nums text-2xl text-accent">
                      {gig.tokenReward}
                    </span>
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                      tokens
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-2 text-right">
                    <Badge variant={cfg.variant} size="sm">
                      {cfg.label}
                    </Badge>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
