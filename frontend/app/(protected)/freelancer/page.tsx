"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Edit3, MessageSquare, Compass } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Skeleton, SkeletonRow } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoCell } from "@/components/ui/bento-grid";
import { MetricTile } from "@/components/ui/metric-tile";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stamp } from "@/components/ui/stamp";
import { Avatar } from "@/components/ui/avatar";
import type { Gig, GigWithProposal } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

interface Profile {
  profileCompletionPct?: number;
  availability?: string;
  acceptanceRate?: number;
}

export default function FreelancerDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Freelancer");
  const [myGigs, setMyGigs] = useState<GigWithProposal[]>([]);
  const [openGigs, setOpenGigs] = useState<Gig[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userId = "";
    try {
      const user = JSON.parse(localStorage.getItem("campusgigs_user") || "{}");
      setUserName(user.fullName || user.full_name || "Freelancer");
      userId = user.id || "";
    } catch {
      /* ignore */
    }

    const token = localStorage.getItem("campusgigs_token");
    if (!token) return;

    Promise.all([
      fetch(`${API}/api/gigs/my-proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${API}/api/gigs?limit=5`).then((r) => r.json()),
      fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      userId
        ? fetch(`${API}/api/freelancers/${userId}`).then((r) =>
            r.ok ? r.json() : null
          )
        : Promise.resolve(null),
    ])
      .then(([proposalsData, gigsData, notifData, profileData]) => {
        if (Array.isArray(proposalsData?.data)) setMyGigs(proposalsData.data);
        if (Array.isArray(gigsData?.data)) setOpenGigs(gigsData.data);
        if (Array.isArray(notifData?.data)) setInbox(notifData.data.slice(0, 3));
        if (profileData) setProfile(profileData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = userName.split(" ")[0];
  const activeCount = myGigs.filter(
    (g) =>
      g.proposal.status === "accepted" &&
      ["in_progress", "pending_completion"].includes(g.status)
  ).length;
  const totalEarned = myGigs
    .filter((g) => g.status === "closed")
    .reduce((sum, g) => sum + g.tokenReward, 0);
  const totalProposals = myGigs.length;
  const acceptedCount = myGigs.filter(
    (g) => g.proposal.status === "accepted"
  ).length;
  const acceptanceRate =
    totalProposals > 0 ? Math.round((acceptedCount / totalProposals) * 100) : 0;

  const completionPct = profile.profileCompletionPct ?? 0;
  const availabilityLabel: Record<string, { label: string; color: string }> = {
    available: { label: "Available", color: "bg-success" },
    busy: { label: "Busy", color: "bg-warning" },
    away: { label: "Away", color: "bg-muted" },
    not_available: { label: "Unavailable", color: "bg-error" },
  };
  const availability =
    availabilityLabel[profile.availability ?? "available"] ??
    availabilityLabel.available;

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
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
              <span
                className={`w-2 h-2 rounded-full ${availability.color}`}
              ></span>
              {availability.label}
            </span>
            <h1 className="mt-3 font-serif text-[2.6rem] sm:text-[3.4rem] leading-[1] tracking-tight text-foreground">
              {greeting()}{" "}
              <em className="italic text-primary">{firstName}.</em>
            </h1>
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end">
            <Button
              onClick={() => router.push("/freelancer/gigs")}
              variant="outline"
              size="lg"
            >
              <Compass className="w-4 h-4" />
              Browse gigs
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
              <BentoCell colSpan={12} mdColSpan={7} rowSpan={2}>
                <Skeleton className="h-full min-h-[280px]" />
              </BentoCell>
              <BentoCell colSpan={12} mdColSpan={5}>
                <Skeleton className="h-full min-h-[140px]" />
              </BentoCell>
              <BentoCell colSpan={12} mdColSpan={5}>
                <Skeleton className="h-full min-h-[140px]" />
              </BentoCell>
            </BentoGrid>
          ) : (
            <BentoGrid>
              {/* Hero — tokens earned */}
              <BentoCell colSpan={12} mdColSpan={8} rowSpan={2}>
                <MetricTile
                  label="Tokens earned this term"
                  value={totalEarned}
                  size="xl"
                  tone="accent"
                  footnote={`Across ${myGigs.filter((g) => g.status === "closed").length} completed gig${myGigs.filter((g) => g.status === "closed").length === 1 ? "" : "s"}.`}
                  className="h-full"
                />
              </BentoCell>

              <BentoCell colSpan={6} mdColSpan={4}>
                <MetricTile
                  label="Active gigs"
                  value={activeCount}
                  size="md"
                  className="h-full"
                />
              </BentoCell>

              <BentoCell colSpan={6} mdColSpan={4}>
                <MetricTile
                  label="Acceptance rate"
                  value={`${acceptanceRate}%`}
                  size="md"
                  className="h-full"
                  footnote={`${acceptedCount} / ${totalProposals} proposals accepted.`}
                />
              </BentoCell>

              {/* Recommended gigs */}
              <BentoCell colSpan={12} mdColSpan={7} rowSpan={2}>
                <div className="flex h-full flex-col rounded-md border border-border bg-surface">
                  <div className="px-5 pt-5 pb-3 border-b border-rule">
                    <SectionHeading
                      title="Recommended gigs"
                      kicker="For you"
                      action={
                        <button
                          onClick={() => router.push("/freelancer/gigs")}
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors"
                        >
                          Browse all →
                        </button>
                      }
                      className="border-0 pb-0"
                    />
                  </div>
                  {openGigs.length === 0 ? (
                    <div className="flex-1 grid place-items-center p-8">
                      <EmptyState
                        title="No open gigs right now."
                        description="Check back soon — new gigs land throughout the week."
                        className="border-0 bg-transparent"
                      />
                    </div>
                  ) : (
                    <ul className="divide-y divide-rule">
                      {openGigs.map((gig) => (
                        <li key={gig.id}>
                          <button
                            onClick={() =>
                              router.push(`/freelancer/gigs/${gig.id}`)
                            }
                            className="w-full text-left flex items-start gap-3 px-5 py-4 hover:bg-surface-elevated transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-serif text-base text-foreground truncate">
                                {gig.title}
                              </p>
                              <div className="mt-1 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                                <span className="truncate">
                                  {gig.clientName}
                                </span>
                                <span className="tabular-nums">
                                  {gig.proposalCount} proposals
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-serif tabular-nums text-xl text-accent">
                                {gig.tokenReward}
                              </span>
                              <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                                tok
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </BentoCell>

              {/* Profile completion */}
              <BentoCell colSpan={12} mdColSpan={5}>
                <button
                  onClick={() => router.push("/freelancer/profile/edit")}
                  className="group h-full w-full text-left flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-5 hover:bg-surface-elevated hover:border-rule-strong transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                      Profile
                    </span>
                    <p className="mt-2 font-serif tabular-nums text-4xl text-foreground leading-none">
                      {completionPct}%
                    </p>
                    <p className="mt-2 text-[13px] text-muted">
                      {completionPct >= 80
                        ? "Profile is complete."
                        : "Finish profile to win more proposals."}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ProfileArc pct={completionPct} />
                    <Edit3 className="size-3 text-muted group-hover:text-primary transition-colors" />
                  </div>
                </button>
              </BentoCell>

              {/* Inbox */}
              <BentoCell colSpan={12} mdColSpan={5}>
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
                                router.push(`/freelancer/gigs/${item.gigId}`);
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

              {/* Decorative footer mark */}
              <BentoCell colSpan={12} mdColSpan={2}>
                <div className="h-full grid place-items-center rounded-md border border-dashed border-rule bg-surface-elevated/30 py-6">
                  <Stamp variant="seal" tone="moss" size={88} rotation={-7} />
                </div>
              </BentoCell>
            </BentoGrid>
          )}
        </section>

        {loading && openGigs.length === 0 ? (
          <section className="mt-10 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </section>
        ) : null}

        <span className="hidden">
          <ArrowRight />
        </span>
      </main>
    </div>
  );
}

function ProfileArc({ pct }: { pct: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-rule"
      />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        className="text-primary"
      />
    </svg>
  );
}
