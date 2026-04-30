"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Users, MessageSquare } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoCell } from "@/components/ui/bento-grid";
import { MetricTile } from "@/components/ui/metric-tile";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stamp } from "@/components/ui/stamp";
import { Avatar } from "@/components/ui/avatar";
import type { Gig, GigStatus } from "@/lib/types";

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
  pending_completion: { label: "Pending Review", variant: "warning" },
  closed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Working late,";
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

interface InboxItem {
  id: string;
  message: string;
  gigId: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Client");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState<InboxItem[]>([]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("campusgigs_user") || "{}");
      setUserName(user.fullName || user.full_name || "Client");
    } catch {
      /* ignore */
    }

    const token = localStorage.getItem("campusgigs_token");
    if (!token) return;

    Promise.all([
      fetch(`${API}/api/gigs/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data?.data)) setGigs(data.data);
        })
        .catch(() => {}),
      fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data?.data)) setInbox(data.data.slice(0, 3));
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const firstName = userName.split(" ")[0];
  const proposalsTotal = gigs.reduce(
    (sum, g) => sum + (g.pendingProposalCount ?? 0),
    0
  );
  const tokensDeployed = gigs
    .filter((g) => ["open", "in_progress", "pending_completion"].includes(g.status))
    .reduce((sum, g) => sum + (g.tokenReward ?? 0), 0);
  const completedCount = gigs.filter((g) => g.status === "closed").length;
  const recentGigs = gigs.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 lg:py-14">
        {/* Greeting */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="grid grid-cols-12 gap-6 items-end pb-8 border-b border-rule"
        >
          <div className="col-span-12 md:col-span-9">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
            <h1 className="mt-3 font-serif text-[2.6rem] sm:text-[3.4rem] leading-[1] tracking-tight text-foreground">
              {greeting()}{" "}
              <em className="italic text-primary">{firstName}.</em>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end">
            <Button
              onClick={() => router.push("/client/gigs/new")}
              variant="accent"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              Post a gig
            </Button>
          </div>
        </motion.section>

        {/* Bento */}
        <section className="mt-10">
          {loading ? (
            <BentoGrid>
              <BentoCell colSpan={12} mdColSpan={8} rowSpan={2}>
                <Skeleton className="h-full min-h-[280px]" />
              </BentoCell>
              <BentoCell colSpan={6} mdColSpan={4}>
                <Skeleton className="h-full min-h-[140px]" />
              </BentoCell>
              <BentoCell colSpan={6} mdColSpan={4}>
                <Skeleton className="h-full min-h-[140px]" />
              </BentoCell>
              <BentoCell colSpan={12} mdColSpan={6} rowSpan={2}>
                <Skeleton className="h-full min-h-[280px]" />
              </BentoCell>
              <BentoCell colSpan={12} mdColSpan={6}>
                <Skeleton className="h-full min-h-[140px]" />
              </BentoCell>
              <BentoCell colSpan={12} mdColSpan={6}>
                <Skeleton className="h-full min-h-[140px]" />
              </BentoCell>
            </BentoGrid>
          ) : (
            <BentoGrid>
              {/* Hero — open proposals */}
              <BentoCell colSpan={12} mdColSpan={8} rowSpan={2}>
                <MetricTile
                  label="Open proposals across gigs"
                  value={proposalsTotal}
                  size="xl"
                  footnote={`Across ${gigs.filter((g) => g.status === "open").length} open gig${gigs.filter((g) => g.status === "open").length === 1 ? "" : "s"}.`}
                  href="/client/gigs"
                  className="h-full"
                />
              </BentoCell>

              <BentoCell colSpan={6} mdColSpan={4}>
                <MetricTile
                  label="Tokens deployed"
                  value={tokensDeployed}
                  size="md"
                  tone="accent"
                  className="h-full"
                />
              </BentoCell>

              <BentoCell colSpan={6} mdColSpan={4}>
                <MetricTile
                  label="Completed gigs"
                  value={completedCount}
                  size="md"
                  className="h-full"
                />
              </BentoCell>

              {/* Recent gigs list */}
              <BentoCell colSpan={12} mdColSpan={6} rowSpan={2}>
                <div className="flex h-full flex-col rounded-md border border-border bg-surface">
                  <div className="px-5 pt-5 pb-3 border-b border-rule">
                    <SectionHeading
                      title="Recent gigs"
                      kicker="Activity"
                      action={
                        gigs.length > 5 ? (
                          <button
                            onClick={() => router.push("/client/gigs")}
                            className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors"
                          >
                            View all →
                          </button>
                        ) : null
                      }
                      className="border-0 pb-0"
                    />
                  </div>
                  {recentGigs.length === 0 ? (
                    <div className="flex-1 grid place-items-center p-8">
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
                        className="border-0 bg-transparent"
                      />
                    </div>
                  ) : (
                    <ul className="divide-y divide-rule">
                      {recentGigs.map((gig) => {
                        const cfg = statusConfig[gig.status];
                        return (
                          <li key={gig.id}>
                            <button
                              onClick={() =>
                                router.push(`/client/gigs/${gig.id}`)
                              }
                              className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-surface-elevated transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-serif text-base text-foreground truncate">
                                  {gig.title}
                                </p>
                                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle mt-0.5 truncate">
                                  {gig.freelancerName
                                    ? `Assigned · ${gig.freelancerName}`
                                    : `${gig.pendingProposalCount} proposals`}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-mono text-xs tabular-nums text-accent">
                                  {gig.tokenReward}
                                </span>
                                <Badge variant={cfg.variant} size="sm">
                                  {cfg.label}
                                </Badge>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </BentoCell>

              {/* Find a freelancer CTA */}
              <BentoCell colSpan={12} mdColSpan={6}>
                <button
                  onClick={() => router.push("/client/freelancers")}
                  className="group h-full w-full text-left flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-6 hover:bg-surface-elevated hover:border-rule-strong transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Stamp variant="seal" tone="terracotta" size={64} rotation={-6} />
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                        Discover
                      </span>
                      <h3 className="mt-1 font-serif text-2xl text-foreground">
                        Find a freelancer.
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        Browse verified student talent.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted shrink-0 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </button>
              </BentoCell>

              {/* Inbox preview */}
              <BentoCell colSpan={12} mdColSpan={6}>
                <div className="h-full rounded-md border border-border bg-surface flex flex-col">
                  <div className="px-5 pt-5 pb-3 border-b border-rule flex items-center gap-2">
                    <MessageSquare className="size-4 text-muted" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                      Inbox
                    </span>
                  </div>
                  {inbox.length === 0 ? (
                    <div className="flex-1 grid place-items-center p-6">
                      <p className="text-[13px] text-muted">
                        No new activity.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-rule">
                      {inbox.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => {
                              if (item.gigId) {
                                router.push(`/client/gigs/${item.gigId}`);
                              }
                            }}
                            className="w-full text-left flex items-start gap-3 px-5 py-3 hover:bg-surface-elevated transition-colors"
                          >
                            <Avatar size="sm" fallback="·" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] text-foreground line-clamp-2">
                                {item.message}
                              </p>
                              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle tabular-nums">
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </BentoCell>
            </BentoGrid>
          )}
        </section>

        {loading && recentGigs.length === 0 ? (
          <section className="mt-10 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </section>
        ) : null}

        <span className="hidden">
          <Users />
        </span>
      </main>
    </div>
  );
}
