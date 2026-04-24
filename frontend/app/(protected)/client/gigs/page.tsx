"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Briefcase, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Gig, GigStatus } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const statusConfig: Record<GigStatus, { label: string; variant: "primary" | "secondary" | "warning" | "success" | "error" }> = {
  open: { label: "Open", variant: "primary" },
  in_progress: { label: "In Progress", variant: "secondary" },
  pending_completion: { label: "Pending Review", variant: "warning" },
  closed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function ClientGigsPage() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("campusgigs_token");
    if (!token) { router.replace("/signin"); return; }

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

  const counts = {
    open: gigs.filter((g) => g.status === "open").length,
    active: gigs.filter((g) => ["in_progress", "pending_completion"].includes(g.status)).length,
    closed: gigs.filter((g) => g.status === "closed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-5 pt-24 pb-16">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Gigs</h1>
              <p className="text-sm text-muted mt-1">Manage your posted gigs</p>
            </div>
            <Button size="sm" onClick={() => router.push("/client/gigs/new")}>
              <Plus className="w-4 h-4" />
              Post Gig
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
            {[
              { label: "Open", value: counts.open, icon: Briefcase, color: "text-primary", bg: "bg-primary/8", border: "border-primary/15" },
              { label: "Active", value: counts.active, icon: Clock, color: "text-secondary", bg: "bg-secondary/8", border: "border-secondary/15" },
              { label: "Completed", value: counts.closed, icon: CheckCircle, color: "text-success", bg: "bg-success/8", border: "border-success/15" },
            ].map((s) => (
              <div key={s.label} className={`p-4 rounded-lg border ${s.border} ${s.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-muted">{s.label}</span>
                </div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Error */}
          {error && <p className="text-sm text-error">{error}</p>}

          {/* Loading */}
          {loading && (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && gigs.length === 0 && (
            <motion.div variants={itemVariants} className="py-16 text-center">
              <Briefcase className="w-10 h-10 text-muted/30 mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">No gigs yet</p>
              <p className="text-sm text-muted mt-1 mb-4">Post your first gig to find talent</p>
              <Button size="sm" onClick={() => router.push("/client/gigs/new")}>
                <Plus className="w-4 h-4" /> Post Gig
              </Button>
            </motion.div>
          )}

          {/* Gig list */}
          {!loading && gigs.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-lg border border-border bg-surface overflow-hidden">
              {gigs.map((gig, i) => {
                const cfg = statusConfig[gig.status];
                return (
                  <div
                    key={gig.id}
                    onClick={() => router.push(`/client/gigs/${gig.id}`)}
                    className={cn(
                      "flex items-center justify-between px-5 py-4 hover:bg-surface-elevated transition-colors cursor-pointer",
                      i < gigs.length - 1 && "border-b border-border/60"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{gig.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                        {gig.freelancerName ? (
                          <span>Assigned to {gig.freelancerName}</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {gig.pendingProposalCount} proposal{gig.pendingProposalCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-sm font-bold text-accent">{gig.tokenReward} tok</span>
                      <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
