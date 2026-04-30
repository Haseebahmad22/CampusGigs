"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Send,
  Briefcase,
  Coins,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toaster";
import {
  FileDropzone,
  type Attachment,
} from "@/components/upload/FileDropzone";
import { GigMessageThread } from "@/components/messaging/GigMessageThread";
import type { Gig, ProposalStatus } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const proposalStatusConfig: Record<
  ProposalStatus,
  { label: string; variant: "primary" | "success" | "error" }
> = {
  pending: { label: "Pending", variant: "primary" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Not selected", variant: "error" },
};

export default function FreelancerGigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const gigId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [gig, setGig] = useState<Gig | null>(null);
  const [specs, setSpecs] = useState<Attachment[]>([]);
  const [submissions, setSubmissions] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

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
    if (!token || !gigId) return;
    try {
      const res = await fetch(`${API}/api/gigs/${gigId}`, { headers });
      const data = await res.json();
      if (data?.id) setGig(data);
      else setError(data?.error || "Gig not found.");
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

  const handleSubmitProposal = async () => {
    if (!coverLetter.trim()) {
      toast.error("Write a proposal first");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch(`${API}/api/gigs/${gigId}/proposals`, {
        method: "POST",
        headers,
        body: JSON.stringify({ coverLetter: coverLetter.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          "Could not submit proposal",
          data?.error || "Please try again."
        );
        return;
      }
      toast.success("Proposal submitted", "The client will review it shortly.");
      await loadGig();
    } catch {
      toast.error("Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (submissions.length === 0) {
      toast.error(
        "Upload your work first",
        "Attach at least one deliverable file before marking complete."
      );
      return;
    }
    setCompleting(true);
    try {
      const res = await fetch(`${API}/api/gigs/${gigId}/complete`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Could not submit work", data?.error || "Please try again.");
        return;
      }
      toast.success("Submitted for review", "Waiting for client confirmation.");
      await loadGig();
    } catch {
      toast.error("Request failed");
    } finally {
      setCompleting(false);
    }
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

  const hasProposal = !!gig.myProposal;
  const isAssigned = gig.freelancerId === currentUserId;
  const showWorkTab =
    isAssigned ||
    gig.status === "open" ||
    (hasProposal && gig.status !== "cancelled");
  const showMessages =
    isAssigned &&
    ["in_progress", "pending_completion", "closed"].includes(gig.status) &&
    currentUserId;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 lg:py-14">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {error && <p className="mb-6 text-sm text-error">{error}</p>}

        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="pb-8 border-b border-rule grid grid-cols-12 gap-6 items-start"
        >
          <div className="col-span-12 md:col-span-9 min-w-0">
            <div className="flex items-center gap-3">
              <Avatar fallback={gig.clientName} size="md" />
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                  Client
                </span>
                <p className="text-[14px] text-foreground">{gig.clientName}</p>
              </div>
            </div>
            <h1 className="mt-5 font-serif text-[2.4rem] sm:text-[3rem] leading-[1.05] tracking-tight text-foreground">
              {gig.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
              {gig.categoryName ? (
                <span>{gig.categoryName}</span>
              ) : null}
              <span className="tabular-nums">
                Posted ·{" "}
                {new Date(gig.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="tabular-nums">
                {gig.proposalCount} proposal
                {gig.proposalCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3 md:text-right">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
              Reward
            </span>
            <div className="mt-2 inline-flex items-baseline gap-2 md:flex md:flex-col md:items-end">
              <span className="font-serif tabular-nums text-5xl text-accent leading-none">
                {gig.tokenReward}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                tokens
              </span>
            </div>
            <p className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              <Coins className="size-3" />
              Held in escrow
            </p>
          </div>
        </motion.section>

        {/* Tabs */}
        <section className="mt-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="files" count={specs.length}>
                Files
              </TabsTrigger>
              {showWorkTab ? (
                <TabsTrigger value="work">Work</TabsTrigger>
              ) : null}
              {showMessages ? (
                <TabsTrigger value="messages">Messages</TabsTrigger>
              ) : null}
            </TabsList>

            <TabsContent value="overview">
              <SectionHeading title="Brief" kicker="From the client" />
              <p className="mt-6 font-serif text-[17px] text-foreground/90 leading-[1.7] whitespace-pre-line max-w-3xl">
                {gig.description}
              </p>

              {gig.status === "closed" && isAssigned ? (
                <div className="mt-8 rounded-md border border-success/40 bg-success/5 p-5 max-w-md">
                  <CheckCircle className="size-5 text-success mb-2" />
                  <p className="font-serif text-lg text-foreground">
                    Gig closed.
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {gig.tokenReward} tokens released to your account.
                  </p>
                </div>
              ) : null}

              {gig.status !== "open" && !hasProposal && !isAssigned ? (
                <div className="mt-8 rounded-md border border-rule bg-surface-elevated/40 p-6 max-w-md">
                  <Briefcase className="size-5 text-muted mb-2" />
                  <p className="font-serif text-lg text-foreground">
                    Closed to new proposals.
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    This gig is no longer accepting applications.
                  </p>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="files">
              <SectionHeading
                title="Reference files"
                kicker={`${specs.length} file${specs.length !== 1 ? "s" : ""}`}
              />
              <div className="mt-6">
                {specs.length === 0 ? (
                  <p className="text-sm text-muted">
                    No reference files attached.
                  </p>
                ) : (
                  <FileDropzone
                    gigId={gig.id}
                    kind="spec"
                    attachments={specs}
                    onChange={setSpecs}
                    canEdit={false}
                  />
                )}
              </div>
            </TabsContent>

            {showWorkTab ? (
              <TabsContent value="work">
                {/* Apply state */}
                {gig.status === "open" && !hasProposal ? (
                  <div>
                    <SectionHeading
                      title="Submit a proposal"
                      kicker="Apply for this gig"
                    />
                    <div className="mt-6 max-w-2xl space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cover">Cover letter</Label>
                        <Textarea
                          id="cover"
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Introduce yourself, describe your relevant experience, and how you'd approach this work…"
                          rows={6}
                          maxLength={2000}
                        />
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle tabular-nums">
                          {coverLetter.length} / 2000
                        </p>
                      </div>
                      <Button
                        onClick={handleSubmitProposal}
                        loading={submitting}
                        disabled={!coverLetter.trim()}
                        variant="accent"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit proposal
                      </Button>
                    </div>
                  </div>
                ) : null}

                {/* Already submitted */}
                {hasProposal && !isAssigned ? (
                  <div>
                    <SectionHeading
                      title="Your proposal"
                      kicker={`Submitted · ${proposalStatusConfig[gig.myProposal!.status].label}`}
                      action={
                        <Badge
                          variant={
                            proposalStatusConfig[gig.myProposal!.status].variant
                          }
                        >
                          {proposalStatusConfig[gig.myProposal!.status].label}
                        </Badge>
                      }
                    />
                    <div className="mt-6 max-w-2xl">
                      <p className="font-serif italic text-[16px] text-foreground/85 leading-relaxed border-l-2 border-rule pl-4 whitespace-pre-line">
                        {gig.myProposal!.coverLetter}
                      </p>
                      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle tabular-nums">
                        Submitted{" "}
                        {new Date(
                          gig.myProposal!.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Assigned — deliverables */}
                {isAssigned &&
                (gig.status === "in_progress" ||
                  gig.status === "pending_completion") ? (
                  <div>
                    <SectionHeading
                      title="Deliverables"
                      kicker={`${submissions.length} file${submissions.length !== 1 ? "s" : ""}`}
                      action={
                        gig.status === "in_progress" ? (
                          <Button
                            onClick={handleMarkComplete}
                            loading={completing}
                            disabled={submissions.length === 0 || completing}
                            variant="accent"
                            size="sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark
                            complete
                          </Button>
                        ) : (
                          <Badge variant="warning" size="sm">
                            Awaiting client
                          </Badge>
                        )
                      }
                    />
                    <p className="mt-6 max-w-md text-sm text-muted">
                      Upload the completed work the client will review.
                    </p>
                    <div className="mt-4">
                      <FileDropzone
                        gigId={gig.id}
                        kind="submission"
                        attachments={submissions}
                        onChange={setSubmissions}
                        canEdit={gig.status === "in_progress"}
                        emptyHint="No deliverables uploaded yet."
                      />
                    </div>
                  </div>
                ) : null}
              </TabsContent>
            ) : null}

            {showMessages ? (
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
          </Tabs>
        </section>
      </main>
    </div>
  );
}
