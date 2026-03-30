"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, Clock, CheckCircle, XCircle, Send, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GigWithProposal, GigStatus, ProposalStatus } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Tab = "active" | "proposals" | "completed";

const proposalBadge: Record<ProposalStatus, { label: string; variant: "primary" | "success" | "error" }> = {
  pending: { label: "Pending", variant: "primary" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Not Selected", variant: "error" },
};

const gigBadge: Record<GigStatus, { label: string; variant: "primary" | "secondary" | "warning" | "success" | "error" }> = {
  open: { label: "Open", variant: "primary" },
  in_progress: { label: "In Progress", variant: "secondary" },
  pending_completion: { label: "Submitted", variant: "warning" },
  closed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

export default function MyGigsPage() {
  const router = useRouter();
  const [items, setItems] = useState<GigWithProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("active");
  const [actionLoading, setActionLoading] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("campusgigs_token") : null;

  const loadData = () => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/api/gigs/my-proposals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.data)) setItems(data.data);
        else setError(data?.error || "Failed to load.");
      })
      .catch(() => setError("Unable to connect to backend."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) { router.replace("/signin"); return; }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  const activeGigs = items.filter((g) =>
    g.proposal.status === "accepted" && ["in_progress", "pending_completion"].includes(g.status)
  );
  const proposalGigs = items.filter((g) =>
    g.proposal.status === "pending" || (g.proposal.status === "rejected")
  );
  const completedGigs = items.filter((g) => g.status === "closed");

  const displayed = tab === "active" ? activeGigs : tab === "proposals" ? proposalGigs : completedGigs;

  const handleMarkComplete = async (gigId: string) => {
    setActionLoading(gigId);
    try {
      const res = await fetch(`${API}/api/gigs/${gigId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "Failed."); return; }
      loadData();
    } catch {
      setError("Request failed.");
    } finally {
      setActionLoading("");
    }
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "active", label: "Active", count: activeGigs.length },
    { id: "proposals", label: "Proposals", count: proposalGigs.length },
    { id: "completed", label: "Completed", count: completedGigs.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-5 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Gigs</h1>
            <p className="text-sm text-muted mt-1">Track your proposals and active work</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                  tab === t.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                )}
              >
                {t.label}
                {t.count > 0 && (
                  <span className="ml-1.5 text-xs bg-surface-elevated border border-border rounded-full px-1.5 py-0.5">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          {loading && (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && displayed.length === 0 && (
            <div className="py-16 text-center">
              <Briefcase className="w-10 h-10 text-muted/30 mx-auto mb-3" />
              <p className="text-sm text-muted">
                {tab === "active" && "No active gigs. Browse gigs to find work."}
                {tab === "proposals" && "No pending proposals."}
                {tab === "completed" && "No completed gigs yet."}
              </p>
              {tab === "active" && (
                <Button size="sm" className="mt-4" onClick={() => router.push("/freelancer/gigs")}>
                  Browse Gigs
                </Button>
              )}
            </div>
          )}

          {/* Items */}
          {!loading && displayed.length > 0 && (
            <div className="space-y-3">
              {displayed.map((item) => {
                const gb = gigBadge[item.status];
                const pb = proposalBadge[item.proposal.status];

                return (
                  <div
                    key={item.proposal.id}
                    className="rounded-lg border border-border bg-surface p-5 hover:border-primary/15 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className="text-sm font-bold text-foreground hover:text-primary cursor-pointer transition-colors"
                            onClick={() => router.push(`/freelancer/gigs/${item.id}`)}
                          >
                            {item.title}
                          </h3>
                          {tab === "proposals" ? (
                            <Badge variant={pb.variant} size="sm">{pb.label}</Badge>
                          ) : (
                            <Badge variant={gb.variant} size="sm">{gb.label}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                          <span>by {item.clientName}</span>
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3 text-accent" />
                            {item.tokenReward} tok
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.proposal.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Mark Complete button */}
                      {tab === "active" && item.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkComplete(item.id)}
                          loading={actionLoading === item.id}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                        </Button>
                      )}

                      {tab === "active" && item.status === "pending_completion" && (
                        <Badge variant="warning" size="sm">Awaiting client</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
