"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Coins, Clock, Users, Star, CheckCircle,
  XCircle, Pencil, Trash2, Briefcase, User, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Gig, GigProposal, GigStatus } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const statusConfig: Record<GigStatus, { label: string; variant: "primary" | "secondary" | "warning" | "success" | "error" }> = {
  open: { label: "Open", variant: "primary" },
  in_progress: { label: "In Progress", variant: "secondary" },
  pending_completion: { label: "Pending Review", variant: "warning" },
  closed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

export default function ClientGigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gigId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [gig, setGig] = useState<Gig | null>(null);
  const [proposals, setProposals] = useState<GigProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editReward, setEditReward] = useState("");

  // Review
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<{ id: string; rating: number; comment: string | null; createdAt: string } | null>(null);
  const [reviewChecked, setReviewChecked] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("campusgigs_token") : null;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const loadGig = useCallback(async () => {
    if (!token) return;
    try {
      const [gigRes, propRes] = await Promise.all([
        fetch(`${API}/api/gigs/${gigId}`, { headers }),
        fetch(`${API}/api/gigs/${gigId}/proposals`, { headers }),
      ]);
      const gigData = await gigRes.json();
      const propData = await propRes.json();

      if (!gigRes.ok) { setError(gigData?.error || "Failed to load gig."); return; }
      setGig(gigData);
      if (Array.isArray(propData?.data)) setProposals(propData.data);

      // Check for existing review if gig is closed
      if (gigData.status === "closed") {
        try {
          const revRes = await fetch(`${API}/api/reviews/gig/${gigId}`, { headers });
          const revData = await revRes.json();
          if (revData?.reviewed && revData.review) setExistingReview(revData.review);
        } catch { /* ignore */ }
        setReviewChecked(true);
      }
    } catch {
      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gigId, token]);

  useEffect(() => {
    if (!token) { router.replace("/signin"); return; }
    loadGig();
  }, [token, router, loadGig]);

  const doAction = async (url: string, method = "POST") => {
    setActionLoading(url);
    try {
      const res = await fetch(url, { method, headers });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "Action failed."); return; }
      await loadGig();
      setError("");
    } catch {
      setError("Request failed.");
    } finally {
      setActionLoading("");
    }
  };

  const handleSaveEdit = async () => {
    setActionLoading("edit");
    try {
      const res = await fetch(`${API}/api/gigs/${gigId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ title: editTitle, description: editDesc, tokenReward: Number(editReward) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "Save failed."); return; }
      setEditing(false);
      await loadGig();
    } catch {
      setError("Save failed.");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Cancel this gig? All pending proposals will be notified.")) return;
    await doAction(`${API}/api/gigs/${gigId}`, "DELETE");
    router.push("/client/gigs");
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) { setError("Please select a rating."); return; }
    setReviewSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify({ gigId, rating: reviewRating, comment: reviewComment.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "Failed to submit review."); return; }
      setExistingReview({ id: data.id, rating: data.rating, comment: data.comment, createdAt: data.createdAt });
    } catch {
      setError("Request failed.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const startEdit = () => {
    if (!gig) return;
    setEditTitle(gig.title);
    setEditDesc(gig.description);
    setEditReward(String(gig.tokenReward));
    setEditing(true);
  };

  if (loading || !gig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const cfg = statusConfig[gig.status];
  const pendingProposals = proposals.filter((p) => p.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-4xl mx-auto px-5 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Back */}
          <button
            onClick={() => router.push("/client/gigs")}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Gigs
          </button>

          {error && <p className="text-sm text-error">{error}</p>}

          {/* Gig header card */}
          <div className="rounded-lg border border-border bg-surface p-6">
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={200} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={5} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Token Reward</label>
                  <Input type="number" value={editReward} onChange={(e) => setEditReward(e.target.value)} min={1} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit} loading={actionLoading === "edit"}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-foreground">{gig.title}</h1>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-accent" />
                        <span className="font-bold text-accent">{gig.tokenReward}</span> tokens
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(gig.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {gig.pendingProposalCount} pending proposal{gig.pendingProposalCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {gig.status === "open" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={startEdit}>
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={handleDelete}>
                        <Trash2 className="w-3.5 h-3.5" /> Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted whitespace-pre-line leading-relaxed">{gig.description}</p>
                </div>
              </>
            )}
          </div>

          {/* Assigned freelancer (in_progress / pending_completion) */}
          {gig.freelancerName && ["in_progress", "pending_completion", "closed"].includes(gig.status) && (
            <div className="rounded-lg border border-border bg-surface p-5">
              <h2 className="text-sm font-bold text-foreground mb-3">Assigned Freelancer</h2>
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => router.push(`/freelancer/profile/${gig.freelancerId}`)}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {gig.freelancerAvatar ? (
                    <img src={gig.freelancerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                    {gig.freelancerName}
                  </p>
                  <p className="text-xs text-muted">View profile</p>
                </div>
              </div>
            </div>
          )}

          {/* Pending completion CTA */}
          {gig.status === "pending_completion" && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Work Submitted</h2>
                  <p className="text-sm text-muted mt-0.5">
                    {gig.freelancerName} has marked this gig as completed. Confirm delivery if satisfied.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => doAction(`${API}/api/gigs/${gigId}/confirm`)}
                  loading={actionLoading.includes("confirm")}
                >
                  <CheckCircle className="w-4 h-4" /> Confirm Delivery
                </Button>
              </div>
            </div>
          )}

          {/* Closed summary */}
          {gig.status === "closed" && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <p className="text-sm font-semibold text-foreground">Gig completed successfully</p>
              </div>
              <p className="text-sm text-muted mt-1">
                {gig.tokenReward} tokens were awarded to {gig.freelancerName}.
              </p>
            </div>
          )}

          {/* Review section (closed gigs) */}
          {gig.status === "closed" && reviewChecked && (
            existingReview ? (
              <div className="rounded-lg border border-border bg-surface p-5">
                <h2 className="text-sm font-bold text-foreground mb-3">Your Review</h2>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "w-5 h-5",
                        s <= existingReview.rating ? "text-warning fill-warning" : "text-border"
                      )}
                    />
                  ))}
                  <span className="text-sm font-bold text-foreground ml-1">{existingReview.rating}.0</span>
                </div>
                {existingReview.comment && (
                  <p className="text-sm text-muted leading-relaxed">{existingReview.comment}</p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-surface p-5">
                <h2 className="text-sm font-bold text-foreground mb-1">Leave a Review</h2>
                <p className="text-xs text-muted mb-4">Rate your experience working with {gig.freelancerName}</p>

                {/* Star picker */}
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setReviewHover(s)}
                      onMouseLeave={() => setReviewHover(0)}
                      onClick={() => setReviewRating(s)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "w-7 h-7 transition-colors",
                          s <= (reviewHover || reviewRating)
                            ? "text-warning fill-warning"
                            : "text-border"
                        )}
                      />
                    </button>
                  ))}
                  {reviewRating > 0 && (
                    <span className="text-sm font-bold text-foreground ml-2">{reviewRating}/5</span>
                  )}
                </div>

                {/* Comment */}
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted">{reviewComment.length}/1000</p>
                  <Button
                    size="sm"
                    onClick={handleSubmitReview}
                    loading={reviewSubmitting}
                    disabled={reviewRating === 0}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Submit Review
                  </Button>
                </div>
              </div>
            )
          )}

          {/* Proposals section (open gigs) */}
          {gig.status === "open" && (
            <div className="rounded-lg border border-border bg-surface overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h2 className="text-sm font-bold text-foreground">
                  Proposals ({pendingProposals.length})
                </h2>
              </div>

              {pendingProposals.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Users className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                  <p className="text-sm text-muted">No proposals yet. Freelancers will apply soon.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {pendingProposals.map((p) => (
                    <div key={p.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 cursor-pointer"
                            onClick={() => router.push(`/freelancer/profile/${p.freelancerId}`)}
                          >
                            {p.freelancerAvatar ? (
                              <img src={p.freelancerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-sm font-semibold text-foreground hover:text-primary cursor-pointer transition-colors"
                              onClick={() => router.push(`/freelancer/profile/${p.freelancerId}`)}
                            >
                              {p.freelancerName}
                            </p>
                            {p.freelancerHeadline && (
                              <p className="text-xs text-muted truncate">{p.freelancerHeadline}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                              {p.freelancerRating > 0 && (
                                <span className="flex items-center gap-0.5">
                                  <Star className="w-3 h-3 text-warning fill-warning" />
                                  {p.freelancerRating.toFixed(1)}
                                </span>
                              )}
                              {p.freelancerJobs > 0 && <span>{p.freelancerJobs} jobs</span>}
                              {p.freelancerRate && <span>{p.freelancerRate} tok/hr</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => doAction(`${API}/api/gigs/${gigId}/proposals/${p.id}/accept`, "PATCH")}
                            loading={actionLoading.includes(p.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => doAction(`${API}/api/gigs/${gigId}/proposals/${p.id}/reject`, "PATCH")}
                            loading={actionLoading.includes(p.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>

                      {p.coverLetter && (
                        <div className="mt-3 ml-13 p-3 rounded-lg bg-surface-elevated border border-border/60">
                          <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{p.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
