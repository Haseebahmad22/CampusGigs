"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Coins, Clock, Users, CheckCircle, Send, Briefcase,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { Gig, ProposalStatus } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const proposalStatusConfig: Record<ProposalStatus, { label: string; variant: "primary" | "success" | "error" }> = {
  pending: { label: "Pending", variant: "primary" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Not Selected", variant: "error" },
};

export default function FreelancerGigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gigId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("campusgigs_token") : null;

  useEffect(() => {
    if (!token) { router.replace("/signin"); return; }

    fetch(`${API}/api/gigs/${gigId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setGig(data);
        else setError(data?.error || "Gig not found.");
      })
      .catch(() => setError("Unable to connect to backend."))
      .finally(() => setLoading(false));
  }, [gigId, token, router]);

  const handleSubmitProposal = async () => {
    if (!coverLetter.trim()) { setError("Please write a proposal."); return; }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/gigs/${gigId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ coverLetter: coverLetter.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "Failed to submit."); return; }
      setSubmitted(true);
      // Refetch to get myProposal
      const refetch = await fetch(`${API}/api/gigs/${gigId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = await refetch.json();
      if (updated?.id) setGig(updated);
    } catch {
      setError("Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !gig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const hasProposal = !!gig.myProposal;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-3xl mx-auto px-5 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {error && <p className="text-sm text-error">{error}</p>}

          {/* Gig info */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-foreground">{gig.title}</h1>
              <div className="text-right shrink-0">
                <span className="text-xl font-bold text-accent">{gig.tokenReward}</span>
                <span className="text-sm text-muted ml-1">tok</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted">
              <span>by {gig.clientName}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(gig.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {gig.proposalCount} proposal{gig.proposalCount !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted whitespace-pre-line leading-relaxed">{gig.description}</p>
            </div>
          </div>

          {/* Proposal section */}
          {gig.status === "open" && !hasProposal && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="text-sm font-bold text-foreground mb-3">Submit a Proposal</h2>
              <p className="text-xs text-muted mb-3">
                Tell the client why you are the right fit for this gig.
              </p>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Introduce yourself, describe your relevant experience, and how you'd approach this work..."
                rows={5}
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-muted">{coverLetter.length}/2000</p>
                <Button size="sm" onClick={handleSubmitProposal} loading={submitting} disabled={!coverLetter.trim()}>
                  <Send className="w-3.5 h-3.5" /> Submit Proposal
                </Button>
              </div>
            </div>
          )}

          {/* Already submitted */}
          {hasProposal && (
            <div className="rounded-lg border border-border bg-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-foreground">Your Proposal</h2>
                <Badge variant={proposalStatusConfig[gig.myProposal!.status].variant}>
                  {proposalStatusConfig[gig.myProposal!.status].label}
                </Badge>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-border/60">
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {gig.myProposal!.coverLetter}
                </p>
              </div>
              <p className="text-xs text-muted mt-2">
                Submitted {new Date(gig.myProposal!.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Success message */}
          {submitted && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <p className="text-sm text-foreground">Proposal submitted! The client will review it.</p>
            </div>
          )}

          {/* Gig not open */}
          {gig.status !== "open" && !hasProposal && (
            <div className="rounded-lg border border-border bg-surface-elevated p-5 text-center">
              <Briefcase className="w-8 h-8 text-muted/30 mx-auto mb-2" />
              <p className="text-sm text-muted">This gig is no longer accepting proposals.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
