"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  GraduationCap,
  Star,
  CheckCircle,
  TrendingUp,
  Clock,
  Globe,
  Calendar,
  Award,
  Briefcase,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import type { FreelancerProfile, Review } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
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
              ? "text-warning fill-warning"
              : i === full && hasHalf
                ? "text-warning fill-warning/50"
                : "text-border fill-border"
          )}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatReviewDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function FreelancerPublicProfile() {
  const params = useParams();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeGigs, setActiveGigs] = useState<{ id: string; title: string; tokenReward: number; status: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [workTab, setWorkTab] = useState<"completed" | "in_progress">("completed");

  useEffect(() => {
    const loadData = async () => {
      const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;

      if (!userId) {
        setError("Missing freelancer id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
          const mappedReviews = reviewsPayload.data.map((review: Review) => ({
            ...review,
            gigTitle: review.gigTitle || "Completed Project",
          }));
          setReviews(mappedReviews);
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted">{error || "Loading profile..."}</p>
        </div>
      </div>
    );
  }

  const initials = profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const memberSince = formatDate(profile.createdAt);
  const bioIsLong = (profile.bio?.length || 0) > 300;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-6xl mx-auto px-5 pt-24 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row gap-5"
        >
          {/* Left Sidebar */}
          <motion.div variants={itemVariants} className="lg:w-[280px] shrink-0 space-y-4">
            {/* Profile card */}
            <div className="rounded-lg border border-border bg-surface overflow-hidden">
              <div className="h-16 bg-linear-to-r from-primary/12 via-accent/8 to-secondary/12" />
              <div className="px-5 pb-5 -mt-8 relative">
                <div className="w-16 h-16 rounded-full border-[3px] border-surface overflow-hidden bg-linear-to-br from-primary/20 via-accent/20 to-secondary/20 shadow-lg mx-auto">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl font-bold text-foreground/70">{initials}</span>
                    </div>
                  )}
                </div>
                <div className="text-center mt-2.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <h2 className="text-base font-bold text-foreground">{profile.fullName}</h2>
                    {profile.profileCompletionPct >= 80 && <Shield className="w-3.5 h-3.5 text-secondary" />}
                  </div>
                  {profile.location && (
                    <p className="text-xs text-muted mt-1 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />{profile.location}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", profile.availability === "available" && "bg-success animate-pulse", profile.availability === "busy" && "bg-warning", profile.availability === "away" && "bg-muted", profile.availability === "not_available" && "bg-error")} />
                  <span className="text-xs text-muted capitalize">
                    {profile.availability === "not_available" ? "Not Available" : profile.availability}
                  </span>
                </div>
              </div>
            </div>

            {/* Info sidebar */}
            <div className="rounded-lg border border-border bg-surface p-4 space-y-3.5">
              {profile.hourlyRate && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Hourly Rate</span>
                    <span className="text-sm font-bold text-primary">{profile.hourlyRate} tok/hr</span>
                  </div>
                  <div className="h-px bg-border" />
                </>
              )}
              {profile.languages.length > 0 && (
                <>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1.5">Languages</p>
                    {profile.languages.map((lang) => (
                      <div key={lang} className="flex items-center gap-1.5 text-xs text-muted mb-0.5">
                        <Globe className="w-3 h-3" />{lang}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {profile.university && (
                <>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1.5">Education</p>
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 text-muted mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{profile.university}</p>
                        {profile.department && <p className="text-xs text-muted">{profile.department}</p>}
                        {profile.semester && <p className="text-xs text-muted">{profile.semester}</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="h-px bg-border" />
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Calendar className="w-3.5 h-3.5" />Member since {memberSince}
              </div>
            </div>

            {/* Achievements */}
            <div className="rounded-lg border border-border bg-surface p-4 space-y-2.5">
              <p className="text-sm font-medium text-foreground">Achievements</p>
              {[
                { icon: Award, label: "Top Rated", desc: "4.5+ avg", active: profile.averageRating >= 4.5, color: "text-warning", bg: "bg-warning/8" },
                { icon: TrendingUp, label: "Rising Talent", desc: "10+ gigs", active: profile.totalJobsCompleted >= 10, color: "text-success", bg: "bg-success/8" },
                { icon: CheckCircle, label: "Profile Complete", desc: "80%+", active: profile.profileCompletionPct >= 80, color: "text-secondary", bg: "bg-secondary/8" },
              ].map((a) => (
                <div key={a.label} className={cn("flex items-center gap-2 p-2 rounded-lg", a.active ? a.bg : "opacity-25")}>
                  <a.icon className={cn("w-4 h-4", a.active ? a.color : "text-muted")} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{a.label}</p>
                    <p className="text-[10px] text-muted">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Title + Rate */}
            <motion.div variants={itemVariants} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <h1 className="text-xl font-bold text-foreground leading-tight">
                  {profile.headline || "Freelancer"}
                </h1>
                {profile.hourlyRate && (
                  <p className="text-xl font-bold text-primary shrink-0">
                    {profile.hourlyRate} <span className="text-sm font-normal text-muted">tok/hr</span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="text-sm font-bold text-foreground">{profile.averageRating.toFixed(1)}</span>
                  <span className="text-xs text-muted">({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="font-semibold text-foreground">{profile.totalJobsCompleted}</span>
                  <span className="text-muted">jobs</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-foreground">{profile.totalEarnings.toLocaleString()}</span>
                  <span className="text-muted">tokens earned</span>
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            {profile.bio && (
              <motion.div variants={itemVariants} className="rounded-lg border border-border bg-surface p-5">
                <h2 className="text-sm font-bold text-foreground mb-2.5">About</h2>
                <div className={cn("text-sm text-muted leading-relaxed whitespace-pre-line", !bioExpanded && bioIsLong && "line-clamp-4")}>
                  {profile.bio}
                </div>
                {bioIsLong && (
                  <button
                    onClick={() => setBioExpanded(!bioExpanded)}
                    className="mt-2 text-sm font-medium text-primary hover:text-primary-light transition-colors flex items-center gap-1"
                  >
                    {bioExpanded ? <>less <ChevronUp className="w-3.5 h-3.5" /></> : <>more <ChevronDown className="w-3.5 h-3.5" /></>}
                  </button>
                )}
              </motion.div>
            )}

            {/* Work History */}
            <motion.div variants={itemVariants} className="rounded-lg border border-border bg-surface overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h2 className="text-sm font-bold text-foreground">Work history</h2>
                <div className="flex items-center gap-5 mt-2.5">
                  <button
                    onClick={() => setWorkTab("completed")}
                    className={cn("text-sm font-medium pb-2 transition-colors", workTab === "completed" ? "text-foreground border-b-2 border-primary" : "text-muted hover:text-foreground")}
                  >
                    Completed ({reviews.length})
                  </button>
                  <button
                    onClick={() => setWorkTab("in_progress")}
                    className={cn("text-sm font-medium pb-2 transition-colors", workTab === "in_progress" ? "text-foreground border-b-2 border-primary" : "text-muted hover:text-foreground")}
                  >
                    In progress ({activeGigs.length})
                  </button>
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {workTab === "completed" ? (
                  <>
                    {reviews.map((review) => (
                      <div key={review.id} className="px-5 py-4">
                        <h3 className="text-sm font-medium text-primary">{review.gigTitle}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm font-bold text-foreground">{review.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted ml-1">{formatReviewDate(review.createdAt)}</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted mt-2 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                        )}
                        <p className="text-xs text-muted mt-2">— {review.clientName}</p>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="px-5 py-10 text-center">
                        <Briefcase className="w-7 h-7 text-muted/30 mx-auto mb-2" />
                        <p className="text-sm text-muted">No completed jobs yet</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {activeGigs.map((gig) => (
                      <div key={gig.id} className="px-5 py-4">
                        <h3 className="text-sm font-medium text-primary">{gig.title}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-secondary" />
                            <span className="text-xs text-muted capitalize">{gig.status === "pending_completion" ? "Submitted" : "In Progress"}</span>
                          </div>
                          <span className="text-xs font-semibold text-accent">{gig.tokenReward} tok</span>
                        </div>
                      </div>
                    ))}
                    {activeGigs.length === 0 && (
                      <div className="px-5 py-10 text-center">
                        <Clock className="w-7 h-7 text-muted/30 mx-auto mb-2" />
                        <p className="text-sm text-muted">No active gigs right now</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Skills */}
            {profile.skills.length > 0 && (
              <motion.div variants={itemVariants} className="rounded-lg border border-border bg-surface p-5">
                <h2 className="text-sm font-bold text-foreground mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill.skillId}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border",
                        skill.proficiencyLevel === "expert"
                          ? "bg-primary/8 border-primary/20 text-foreground"
                          : "bg-surface-elevated border-border text-muted"
                      )}
                    >
                      {skill.skillName}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Education */}
            {profile.university && (
              <motion.div variants={itemVariants} className="rounded-lg border border-border bg-surface p-5">
                <h2 className="text-sm font-bold text-foreground mb-3">Education</h2>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{profile.university}</p>
                    {profile.department && <p className="text-xs text-muted mt-0.5">{profile.department}</p>}
                    {profile.semester && <p className="text-xs text-muted mt-0.5">{profile.semester}</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
