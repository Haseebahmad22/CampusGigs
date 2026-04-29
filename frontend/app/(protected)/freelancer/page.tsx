"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock, CheckCircle, TrendingUp, ArrowRight, Edit3, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Badge } from "@/components/ui/badge";
import type { Gig, GigWithProposal, GigStatus } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const statusConfig: Record<GigStatus, { label: string; variant: "primary" | "secondary" | "warning" | "success" | "error" }> = {
  open: { label: "Open", variant: "primary" },
  in_progress: { label: "In Progress", variant: "secondary" },
  pending_completion: { label: "Submitted", variant: "warning" },
  closed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function FreelancerDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Freelancer");
  const [myGigs, setMyGigs] = useState<GigWithProposal[]>([]);
  const [openGigs, setOpenGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("campusgigs_user") || "{}");
      setUserName(user.fullName || user.full_name || "Freelancer");
    } catch { /* ignore */ }

    const token = localStorage.getItem("campusgigs_token");
    if (!token) return;

    Promise.all([
      fetch(`${API}/api/gigs/my-proposals`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API}/api/gigs?limit=4`).then((r) => r.json()),
    ])
      .then(([proposalsData, gigsData]) => {
        if (Array.isArray(proposalsData?.data)) setMyGigs(proposalsData.data);
        if (Array.isArray(gigsData?.data)) setOpenGigs(gigsData.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = userName.split(" ")[0];
  const activeCount = myGigs.filter((g) => g.proposal.status === "accepted" && ["in_progress", "pending_completion"].includes(g.status)).length;
  const completedCount = myGigs.filter((g) => g.status === "closed").length;
  const totalEarned = myGigs.filter((g) => g.status === "closed").reduce((sum, g) => sum + g.tokenReward, 0);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-none mx-auto px-5 pt-24 pb-16">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Greeting */}
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {firstName}</h1>
            <p className="text-sm text-muted mt-1">Here&apos;s what&apos;s happening with your gigs</p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Active Gigs", value: String(activeCount), icon: Clock, color: "text-secondary", bg: "bg-secondary/8", border: "border-secondary/15" },
              { label: "Completed", value: String(completedCount), icon: CheckCircle, color: "text-success", bg: "bg-success/8", border: "border-success/15" },
              { label: "Tokens Earned", value: String(totalEarned), icon: TrendingUp, color: "text-accent", bg: "bg-accent/8", border: "border-accent/15" },
              { label: "Proposals", value: String(myGigs.length), icon: Briefcase, color: "text-primary", bg: "bg-primary/8", border: "border-primary/15" },
            ].map((stat) => (
              <div key={stat.label} className={`p-4 rounded-lg border ${stat.border} ${stat.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Quick actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/freelancer/profile/edit")}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface hover:border-primary/30 hover:bg-surface-elevated transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <Edit3 className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Edit Profile</p>
                <p className="text-xs text-muted mt-0.5">Add bio, skills & education</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
            </button>

            <button
              onClick={() => router.push("/freelancer/gigs")}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface hover:border-secondary/30 hover:bg-surface-elevated transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/15 transition-colors">
                <Briefcase className="w-4.5 h-4.5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Browse Gigs</p>
                <p className="text-xs text-muted mt-0.5">Find work that matches your skills</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-secondary transition-colors" />
            </button>
          </motion.div>

          {/* Available gigs */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Available Gigs</h2>
              <button
                onClick={() => router.push("/freelancer/gigs")}
                className="text-xs text-primary hover:text-primary-light transition-colors font-medium"
              >
                Browse all
              </button>
            </div>

            {loading ? (
              <div className="py-10 flex justify-center">
                <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : openGigs.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface p-8 text-center">
                <Briefcase className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                <p className="text-sm text-muted">No open gigs right now. Check back soon.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-surface overflow-hidden">
                {openGigs.map((gig, i) => (
                  <div
                    key={gig.id}
                    onClick={() => router.push(`/freelancer/gigs/${gig.id}`)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 hover:bg-surface-elevated transition-colors cursor-pointer",
                      i < openGigs.length - 1 && "border-b border-border/60"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{gig.title}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {gig.clientName} · {gig.proposalCount} proposals
                      </p>
                    </div>
                    <div className="shrink-0 ml-4">
                      <span className="text-sm font-semibold text-accent">{gig.tokenReward} tok</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
