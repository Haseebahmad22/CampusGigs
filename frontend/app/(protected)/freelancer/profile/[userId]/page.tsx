"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  GraduationCap,
  Star,
  Globe,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Avatar } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MetricTile } from "@/components/ui/metric-tile";
import { BentoGrid, BentoCell } from "@/components/ui/bento-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Stamp } from "@/components/ui/stamp";
import type { FreelancerProfile, Review } from "@/lib/types";

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25;
  const iconSize = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i < full
              ? "text-accent fill-accent"
              : i === full && hasHalf
                ? "text-accent fill-accent/50"
                : "text-rule"
          )}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function formatReviewDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const availabilityLabel: Record<string, { label: string; dot: string }> = {
  available: { label: "Available", dot: "bg-success" },
  busy: { label: "Busy", dot: "bg-warning" },
  away: { label: "Away", dot: "bg-muted" },
  not_available: { label: "Unavailable", dot: "bg-error" },
};

export default function FreelancerPublicProfile() {
  const params = useParams();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeGigs, setActiveGigs] = useState<
    {
      id: string;
      title: string;
      tokenReward: number;
      status: string;
      createdAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const userId = Array.isArray(params.userId)
        ? params.userId[0]
        : params.userId;

      if (!userId) {
        setError("Missing freelancer id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

        const [profileRes, reviewsRes, activeGigsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/profile/${userId}`),
          fetch(`${apiBaseUrl}/api/freelancers/${userId}/reviews`),
          fetch(`${apiBaseUrl}/api/freelancers/${userId}/active-gigs`),
        ]);

        const profilePayload = await profileRes.json();
        const reviewsPayload = await reviewsRes.json();
        const activeGigsPayload = await activeGigsRes.json();

        if (!profileRes.ok) {
          setError(profilePayload?.error || "Unable to load freelancer profile.");
          return;
        }

        setProfile(profilePayload as FreelancerProfile);

        if (reviewsRes.ok && Array.isArray(reviewsPayload?.data)) {
          setReviews(
            reviewsPayload.data.map((review: Review) => ({
              ...review,
              gigTitle: review.gigTitle || "Completed project",
            }))
          );
        } else {
          setReviews([]);
        }

        if (activeGigsRes.ok && Array.isArray(activeGigsPayload?.data)) {
          setActiveGigs(activeGigsPayload.data);
        }
      } catch {
        setError("Unable to connect to backend. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.userId]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
          {error || "Loading…"}
        </div>
      </div>
    );
  }

  const memberSince = formatDate(profile.createdAt);
  const availability =
    availabilityLabel[profile.availability ?? "available"] ??
    availabilityLabel.available;
  const verified = profile.profileCompletionPct >= 80;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 lg:py-14">
        {/* Magazine cover header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="grid grid-cols-12 gap-6 items-start pb-10 border-b border-rule"
        >
          <div className="col-span-12 md:col-span-9 min-w-0">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full", availability.dot)} />
                {availability.label}
              </span>
              {profile.location ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 font-serif text-[2.6rem] sm:text-[3.6rem] leading-[1] tracking-tight text-foreground">
              {profile.fullName}
            </h1>
            <p className="mt-4 font-serif italic text-[18px] text-muted max-w-2xl">
              {profile.headline || "Freelancer"}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <StarRating rating={profile.averageRating} />
                <span className="tabular-nums">
                  {profile.averageRating.toFixed(1)}
                </span>
                <span className="text-subtle">
                  ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              </span>
              <span className="tabular-nums">
                {profile.totalJobsCompleted} jobs
              </span>
              {profile.hourlyRate ? (
                <span className="tabular-nums">
                  {profile.hourlyRate} tok / hr
                </span>
              ) : null}
              <span className="tabular-nums">Member since {memberSince}</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end">
            <Avatar
              src={profile.avatarUrl}
              fallback={profile.fullName}
              size="xl"
              variant="square"
              verified={verified}
            />
          </div>
        </motion.section>

        {/* Tabs */}
        <section className="mt-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews" count={reviews.length}>
                Reviews
              </TabsTrigger>
              {activeGigs.length > 0 ? (
                <TabsTrigger value="active" count={activeGigs.length}>
                  In progress
                </TabsTrigger>
              ) : null}
            </TabsList>

            <TabsContent value="overview">
              <BentoGrid>
                {/* Bio */}
                {profile.bio ? (
                  <BentoCell colSpan={12} mdColSpan={8} rowSpan={2}>
                    <div className="h-full rounded-md border border-border bg-surface p-6">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                        About
                      </span>
                      <p className="mt-3 font-serif text-[17px] text-foreground/90 leading-[1.7] whitespace-pre-line">
                        {profile.bio}
                      </p>
                    </div>
                  </BentoCell>
                ) : (
                  <BentoCell colSpan={12} mdColSpan={8} rowSpan={2}>
                    <div className="h-full grid place-items-center rounded-md border border-dashed border-rule bg-surface-elevated/40 p-8">
                      <div className="text-center">
                        <Stamp variant="empty" tone="moss" size={140} />
                        <p className="mt-2 font-serif text-base text-foreground">
                          No bio yet.
                        </p>
                      </div>
                    </div>
                  </BentoCell>
                )}

                {/* Tokens earned */}
                <BentoCell colSpan={6} mdColSpan={4}>
                  <MetricTile
                    label="Tokens earned"
                    value={profile.totalEarnings}
                    size="md"
                    tone="accent"
                    className="h-full"
                  />
                </BentoCell>

                {/* Jobs */}
                <BentoCell colSpan={6} mdColSpan={4}>
                  <MetricTile
                    label="Jobs completed"
                    value={profile.totalJobsCompleted}
                    size="md"
                    className="h-full"
                  />
                </BentoCell>

                {/* Skills */}
                {profile.skills.length > 0 ? (
                  <BentoCell colSpan={12} mdColSpan={8}>
                    <div className="rounded-md border border-border bg-surface p-6">
                      <SectionHeading
                        title="Skills"
                        kicker={`${profile.skills.length} total`}
                        as="h3"
                        className="border-0 pb-0"
                      />
                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <span
                            key={skill.skillId}
                            className={cn(
                              "font-mono text-[11px] uppercase tracking-[0.12em] border rounded-sm px-2 py-1",
                              skill.proficiencyLevel === "expert"
                                ? "border-primary text-primary bg-primary/5"
                                : "border-rule text-muted"
                            )}
                          >
                            {skill.skillName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </BentoCell>
                ) : null}

                {/* Education + Languages */}
                <BentoCell colSpan={12} mdColSpan={4}>
                  <div className="h-full rounded-md border border-border bg-surface p-6 space-y-5">
                    {profile.university ? (
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                          Education
                        </span>
                        <div className="mt-2 flex items-start gap-2">
                          <GraduationCap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-serif text-base text-foreground">
                              {profile.university}
                            </p>
                            {profile.department && (
                              <p className="text-[13px] text-muted">
                                {profile.department}
                              </p>
                            )}
                            {profile.semester && (
                              <p className="text-[13px] text-muted">
                                {profile.semester}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {profile.languages.length > 0 ? (
                      <div className={profile.university ? "pt-5 border-t border-rule" : ""}>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                          Languages
                        </span>
                        <div className="mt-2 space-y-1">
                          {profile.languages.map((lang) => (
                            <div
                              key={lang}
                              className="flex items-center gap-2 text-[13px] text-foreground/85"
                            >
                              <Globe className="w-3 h-3 text-muted" />
                              {lang}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </BentoCell>
              </BentoGrid>
            </TabsContent>

            <TabsContent value="reviews">
              <SectionHeading
                title="Client reviews"
                kicker={`${reviews.length} total`}
              />
              {reviews.length === 0 ? (
                <div className="mt-8">
                  <EmptyState
                    title="No reviews yet."
                    description="Completed gigs and client feedback will appear here."
                  />
                </div>
              ) : (
                <ul className="mt-6 divide-y divide-rule">
                  {reviews.map((review) => (
                    <li key={review.id} className="py-6">
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <h3 className="font-serif text-lg text-foreground">
                          {review.gigTitle}
                        </h3>
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle tabular-nums">
                          {formatReviewDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <StarRating rating={review.rating} size="md" />
                        <span className="font-serif tabular-nums text-base text-foreground">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-3 font-serif italic text-[15px] text-muted leading-relaxed border-l-2 border-rule pl-4 max-w-2xl">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      )}
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                        — {review.clientName}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            {activeGigs.length > 0 ? (
              <TabsContent value="active">
                <SectionHeading
                  title="In progress"
                  kicker={`${activeGigs.length} gig${activeGigs.length !== 1 ? "s" : ""}`}
                />
                <ul className="mt-6 divide-y divide-rule">
                  {activeGigs.map((gig) => (
                    <li key={gig.id} className="py-5">
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <h3 className="font-serif text-lg text-foreground">
                          {gig.title}
                        </h3>
                        <span className="font-mono tabular-nums text-[13px] text-accent">
                          {gig.tokenReward} tok
                        </span>
                      </div>
                      <span className="mt-1 inline-flex font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                        {gig.status === "pending_completion"
                          ? "Submitted"
                          : "In progress"}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="hidden">
                  <Briefcase />
                </div>
              </TabsContent>
            ) : null}
          </Tabs>
        </section>
      </main>
    </div>
  );
}
