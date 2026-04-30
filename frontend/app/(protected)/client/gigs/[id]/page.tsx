"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Coins,
  Star,
  CheckCircle,
  Pencil,
  Trash2,
  MessageSquare,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toaster";
import { FileDropzone, type Attachment } from "@/components/upload/FileDropzone";
import { GigMessageThread } from "@/components/messaging/GigMessageThread";
import type { Gig, GigProposal, GigStatus } from "@/lib/types";

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

export default function ClientGigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const gigId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [gig, setGig] = useState<Gig | null>(null);
  const [proposals, setProposals] = useState<GigProposal[]>([]);
  const [specs, setSpecs] = useState<Attachment[]>([]);
  const [submissions, setSubmissions] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editReward, setEditReward] = useState("");

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  } | null>(null);
  const [reviewChecked, setReviewChecked] = useState(false);

  const [confirmDeliveryOpen, setConfirmDeliveryOpen] = useState(false);
  const [cancelGigOpen, setCancelGigOpen] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("campusgigs_token")
      : null;
  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("campusgigs_user") || "{}");
      if (user.id) setCurrentUserId(user.id);
    } catch {
      /* ignore */
    }
  }, []);

  const loadAttachments = useCallback(async () => {
    if (!token || !gigId) return;
    try {
      const res = await fetch(`${API}/api/gigs/${gigId}/attachments`, {
        headers,
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: Attachment[] = data.data || [];
      setSpecs(list.filter((a) => a.kind === "spec"));
      setSubmissions(list.filter((a) => a.kind === "submission"));
    } catch {
      /* ignore */
    }
  }, [gigId, token, headers]);

  const loadGig = useCallback(async () => {
    if (!token) return;
    try {
      const [gigRes, propRes] = await Promise.all([
        fetch(`${API}/api/gigs/${gigId}`, { headers }),
        fetch(`${API}/api/gigs/${gigId}/proposals`, { headers }),
      ]);
      const gigData = await gigRes.json();
      const propData = await propRes.json();

      if (!gigRes.ok) {
        setError(gigData?.error || "Failed to load gig.");
        return;
      }
      setGig(gigData);
      if (Array.isArray(propData?.data)) setProposals(propData.data);

      if (gigData.status === "closed") {
        try {
          const revRes = await fetch(`${API}/api/reviews/gig/${gigId}`, {
            headers,
          });
          const revData = await revRes.json();
          if (revData?.reviewed && revData.review)
            setExistingReview(revData.review);
        } catch {
          /* ignore */
        }
        setReviewChecked(true);
      }

      await loadAttachments();
    } catch {
      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  }, [gigId, token, headers, loadAttachments]);

  useEffect(() => {
    if (!token) {
      router.replace("/signin");
      return;
    }
    loadGig();
  }, [token, router, loadGig]);

  const doAction = async (
    url: string,
    method = "POST",
    successLabel?: string
  ) => {
    setActionLoading(url);
    try {
      const res = await fetch(url, { method, headers });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Action failed", data?.error || "Please try again.");
        return false;
      }
      if (successLabel) toast.success(successLabel);
      await loadGig();
      setError("");
      return true;
    } catch {
      toast.error("Request failed");
      return false;
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
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          tokenReward: Number(editReward),
          categoryId: gig?.categoryId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Save failed", data?.error || "Please try again.");
        return;
      }
      setEditing(false);
      toast.success("Gig updated");
      await loadGig();
    } catch {
      toast.error("Save failed");
    } finally {
      setActionLoading("");
    }
  };

  const handleConfirmDelivery = async () => {
    const ok = await doAction(
      `${API}/api/gigs/${gigId}/confirm`,
      "POST",
      "Delivery confirmed"
    );
    if (ok) setConfirmDeliveryOpen(false);
  };

  const handleCancelGig = async () => {
    const ok = await doAction(
      `${API}/api/gigs/${gigId}`,
      "DELETE",
      "Gig cancelled"
    );
    if (ok) {
      setCancelGigOpen(false);
      router.push("/client/gigs");
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      toast.error("Select a rating");
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API}/api/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          gigId,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          "Could not submit review",
          data?.error || "Please try again."
        );
        return;
      }
      toast.success("Review submitted");
      setExistingReview({
        id: data.id,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt,
      });
    } catch {
      toast.error("Request failed");
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
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
          Loading…
        </div>
      </div>
    );
  }

  const cfg = statusConfig[gig.status];
  const pendingProposals = proposals.filter((p) => p.status === "pending");
  const showMessaging =
    !!gig.freelancerId &&
    ["in_progress", "pending_completion", "closed"].includes(gig.status);
  const showSubmissions = ["pending_completion", "closed"].includes(gig.status);
  const isOpen = gig.status === "open";

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 lg:py-14">
        <button
          onClick={() => router.push("/client/gigs")}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to my gigs
        </button>

        {error && <p className="mb-6 text-sm text-error">{error}</p>}

        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="pb-8 border-b border-rule"
        >
          {editing ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reward">Token reward</Label>
                <Input
                  id="edit-reward"
                  type="number"
                  value={editReward}
                  onChange={(e) => setEditReward(e.target.value)}
                  min={1}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  loading={actionLoading === "edit"}
                  variant="accent"
                >
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-12 md:col-span-9 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                    Gig
                  </span>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  {gig.categoryName ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                      · {gig.categoryName}
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-3 font-serif text-[2.4rem] sm:text-[3rem] leading-[1.05] tracking-tight text-foreground">
                  {gig.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                  <span className="inline-flex items-center gap-1.5 text-accent">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="tabular-nums text-foreground">
                      {gig.tokenReward}
                    </span>{" "}
                    tokens
                  </span>
                  <span className="tabular-nums">
                    Posted ·{" "}
                    {new Date(gig.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="tabular-nums">
                    {gig.pendingProposalCount} proposal
                    {gig.pendingProposalCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {isOpen ? (
                <div className="col-span-12 md:col-span-3 flex md:justify-end gap-2">
                  <Button variant="outline" onClick={startEdit}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setCancelGigOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </motion.section>

        {/* Tabs */}
        {!editing ? (
          <section className="mt-8">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="files" count={specs.length}>
                  Files
                </TabsTrigger>
                {isOpen ? (
                  <TabsTrigger value="proposals" count={pendingProposals.length}>
                    Proposals
                  </TabsTrigger>
                ) : null}
                {showMessaging ? (
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                ) : null}
                {gig.status === "closed" && reviewChecked ? (
                  <TabsTrigger value="review">Review</TabsTrigger>
                ) : null}
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-8">
                    <SectionHeading title="Description" kicker="Brief" />
                    <p className="mt-6 font-serif text-[17px] text-foreground/90 leading-[1.7] whitespace-pre-line">
                      {gig.description}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    {gig.freelancerName &&
                    ["in_progress", "pending_completion", "closed"].includes(
                      gig.status
                    ) ? (
                      <div className="rounded-md border border-border bg-surface p-5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                          Assigned to
                        </span>
                        <button
                          onClick={() =>
                            router.push(
                              `/freelancer/profile/${gig.freelancerId}`
                            )
                          }
                          className="mt-3 flex items-center gap-3 w-full text-left group"
                        >
                          <Avatar
                            src={gig.freelancerAvatar}
                            fallback={gig.freelancerName}
                            size="md"
                          />
                          <div>
                            <p className="font-serif text-base text-foreground group-hover:text-primary transition-colors">
                              {gig.freelancerName}
                            </p>
                            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                              View profile →
                            </span>
                          </div>
                        </button>
                      </div>
                    ) : null}

                    {gig.status === "pending_completion" ? (
                      <div className="mt-4 rounded-md border border-warning/40 bg-warning/5 p-5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-warning">
                          Action required
                        </span>
                        <p className="mt-2 font-serif text-lg text-foreground">
                          Work submitted.
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {gig.freelancerName} marked this gig complete. Review
                          deliverables, then confirm.
                        </p>
                        <Button
                          onClick={() => setConfirmDeliveryOpen(true)}
                          variant="accent"
                          className="mt-4 w-full"
                        >
                          <CheckCircle className="w-4 h-4" /> Confirm delivery
                        </Button>
                      </div>
                    ) : null}

                    {gig.status === "closed" ? (
                      <div className="mt-4 rounded-md border border-success/40 bg-success/5 p-5">
                        <CheckCircle className="size-5 text-success mb-2" />
                        <p className="font-serif text-lg text-foreground">
                          Gig completed.
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {gig.tokenReward} tokens released to{" "}
                          {gig.freelancerName}.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </TabsContent>

              {/* Files */}
              <TabsContent value="files">
                <div className="space-y-12">
                  <div>
                    <SectionHeading
                      title="Reference files"
                      kicker={`${specs.length} file${specs.length !== 1 ? "s" : ""}`}
                    />
                    <div className="mt-6">
                      <FileDropzone
                        gigId={gig.id}
                        kind="spec"
                        attachments={specs}
                        onChange={setSpecs}
                        canEdit={
                          gig.status === "open" || gig.status === "in_progress"
                        }
                        emptyHint="No reference files attached."
                      />
                    </div>
                  </div>

                  {showSubmissions ? (
                    <div>
                      <SectionHeading
                        title="Deliverables"
                        kicker={`${submissions.length} file${submissions.length !== 1 ? "s" : ""}`}
                      />
                      <div className="mt-6">
                        {submissions.length === 0 ? (
                          <p className="text-sm text-muted">
                            No files submitted yet.
                          </p>
                        ) : (
                          <FileDropzone
                            gigId={gig.id}
                            kind="submission"
                            attachments={submissions}
                            onChange={setSubmissions}
                            canEdit={false}
                          />
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </TabsContent>

              {/* Proposals */}
              {isOpen ? (
                <TabsContent value="proposals">
                  <SectionHeading
                    title="Proposals"
                    kicker={`${pendingProposals.length} pending`}
                  />
                  {pendingProposals.length === 0 ? (
                    <div className="mt-8">
                      <EmptyState
                        title="No proposals yet."
                        description="Freelancers will start applying soon. A clear description and reference files help."
                      />
                    </div>
                  ) : (
                    <ul className="mt-6 divide-y divide-rule">
                      {pendingProposals.map((p) => (
                        <li key={p.id} className="py-6">
                          <div className="flex items-start justify-between gap-4">
                            <button
                              onClick={() =>
                                router.push(
                                  `/freelancer/profile/${p.freelancerId}`
                                )
                              }
                              className="flex items-start gap-3 min-w-0 flex-1 text-left group"
                            >
                              <Avatar
                                src={p.freelancerAvatar}
                                fallback={p.freelancerName}
                                size="md"
                              />
                              <div className="min-w-0">
                                <p className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">
                                  {p.freelancerName}
                                </p>
                                {p.freelancerHeadline && (
                                  <p className="text-sm text-muted truncate">
                                    {p.freelancerHeadline}
                                  </p>
                                )}
                                <div className="mt-1.5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                                  {p.freelancerRating > 0 && (
                                    <span className="inline-flex items-center gap-1">
                                      <Star className="w-3 h-3 text-warning fill-warning" />
                                      <span className="tabular-nums">
                                        {p.freelancerRating.toFixed(1)}
                                      </span>
                                    </span>
                                  )}
                                  {p.freelancerJobs > 0 && (
                                    <span className="tabular-nums">
                                      {p.freelancerJobs} jobs
                                    </span>
                                  )}
                                  {p.freelancerRate && (
                                    <span className="tabular-nums">
                                      {p.freelancerRate} tok/hr
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                onClick={() =>
                                  doAction(
                                    `${API}/api/gigs/${gigId}/proposals/${p.id}/accept`,
                                    "PATCH",
                                    "Proposal accepted"
                                  )
                                }
                                loading={actionLoading.includes(p.id)}
                                variant="accent"
                                size="sm"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  doAction(
                                    `${API}/api/gigs/${gigId}/proposals/${p.id}/reject`,
                                    "PATCH",
                                    "Proposal rejected"
                                  )
                                }
                                loading={actionLoading.includes(p.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>

                          {p.coverLetter && (
                            <div className="mt-4 ml-14 border-l-2 border-rule pl-4">
                              <p className="font-serif italic text-[15px] text-muted leading-relaxed whitespace-pre-line">
                                {p.coverLetter}
                              </p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="hidden">
                    <Inbox />
                  </div>
                </TabsContent>
              ) : null}

              {/* Messages */}
              {showMessaging && currentUserId ? (
                <TabsContent value="messages">
                  <SectionHeading title="Messages" kicker="Thread" />
                  <div className="mt-6">
                    <GigMessageThread
                      gigId={gig.id}
                      currentUserId={currentUserId}
                    />
                  </div>
                </TabsContent>
              ) : null}

              {/* Review */}
              {gig.status === "closed" && reviewChecked ? (
                <TabsContent value="review">
                  {existingReview ? (
                    <div>
                      <SectionHeading title="Your review" kicker="Submitted" />
                      <div className="mt-6">
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "w-6 h-6",
                                s <= existingReview.rating
                                  ? "text-accent fill-accent"
                                  : "text-rule"
                              )}
                            />
                          ))}
                          <span className="ml-2 font-serif tabular-nums text-2xl text-foreground">
                            {existingReview.rating}.0
                          </span>
                        </div>
                        {existingReview.comment && (
                          <p className="font-serif italic text-[16px] text-foreground/85 leading-relaxed border-l-2 border-rule pl-4 max-w-2xl">
                            {existingReview.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <SectionHeading
                        title="Leave a review"
                        kicker={`Working with ${gig.freelancerName}`}
                      />
                      <div className="mt-6 max-w-xl">
                        <Label className="mb-3 block">Rating</Label>
                        <div className="flex items-center gap-1">
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
                                  "w-8 h-8 transition-colors",
                                  s <= (reviewHover || reviewRating)
                                    ? "text-accent fill-accent"
                                    : "text-rule"
                                )}
                              />
                            </button>
                          ))}
                          {reviewRating > 0 && (
                            <span className="ml-3 font-serif tabular-nums text-xl text-foreground">
                              {reviewRating}/5
                            </span>
                          )}
                        </div>

                        <div className="mt-6 space-y-2">
                          <Label htmlFor="review-comment">
                            Comment (optional)
                          </Label>
                          <Textarea
                            id="review-comment"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience…"
                            rows={4}
                            maxLength={1000}
                          />
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle tabular-nums">
                            {reviewComment.length} / 1000
                          </p>
                        </div>

                        <Button
                          onClick={handleSubmitReview}
                          loading={reviewSubmitting}
                          disabled={reviewRating === 0}
                          variant="accent"
                          className="mt-6"
                        >
                          <MessageSquare className="w-4 h-4" /> Submit review
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              ) : null}
            </Tabs>
          </section>
        ) : null}
      </main>

      {/* Confirm delivery dialog */}
      <Dialog
        open={confirmDeliveryOpen}
        onOpenChange={setConfirmDeliveryOpen}
        title="Confirm delivery?"
        description={`This releases ${gig.tokenReward} tokens to ${gig.freelancerName ?? "the freelancer"} and closes the gig.`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmDeliveryOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelivery}
              loading={actionLoading.includes("confirm")}
              variant="accent"
            >
              <CheckCircle className="size-4" /> Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Make sure you have reviewed the deliverables. This action can&apos;t
          be undone.
        </p>
      </Dialog>

      {/* Cancel gig dialog */}
      <Dialog
        open={cancelGigOpen}
        onOpenChange={setCancelGigOpen}
        title="Cancel this gig?"
        description="All pending proposals will be notified, and your tokens will be refunded."
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelGigOpen(false)}>
              Keep gig
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelGig}
              loading={
                actionLoading.includes("DELETE") ||
                actionLoading.endsWith(gig.id)
              }
            >
              <Trash2 className="size-4" /> Cancel gig
            </Button>
          </>
        }
      />
    </div>
  );
}
