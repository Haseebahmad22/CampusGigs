"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Edit3,
  Eye,
  Briefcase,
  Users,
  Zap,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";

const availableGigs = [
  { title: "Design Social Media Graphics", client: "TechClub", budget: 40, category: "Design", deadline: "3 days" },
  { title: "Develop React Component", client: "StartupHub", budget: 80, category: "Dev", deadline: "5 days" },
  { title: "Edit Research Paper", client: "AcadSoc", budget: 25, category: "Writing", deadline: "2 days" },
  { title: "Build Landing Page for Event", client: "IEEE Society", budget: 60, category: "Dev", deadline: "4 days" },
];

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

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("campusgigs_user") || "{}");
      setUserName(user.fullName || user.full_name || "Freelancer");
    } catch { /* ignore */ }
  }, []);

  const firstName = userName.split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-5 pt-24 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Greeting */}
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-muted mt-1">
              Here&apos;s what&apos;s happening with your gigs
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Active Gigs", value: "2", icon: Clock, color: "text-secondary", bg: "bg-secondary/8", border: "border-secondary/15" },
              { label: "Completed", value: "7", icon: CheckCircle, color: "text-success", bg: "bg-success/8", border: "border-success/15" },
              { label: "Tokens Earned", value: "340", icon: TrendingUp, color: "text-accent", bg: "bg-accent/8", border: "border-accent/15" },
              { label: "Rating", value: "4.8", icon: Star, color: "text-warning", bg: "bg-warning/8", border: "border-warning/15" },
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
              onClick={() => {
                const user = JSON.parse(localStorage.getItem("campusgigs_user") || "{}");
                router.push(`/freelancer/profile/${user.id || "demo"}`);
              }}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface hover:border-secondary/30 hover:bg-surface-elevated transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/15 transition-colors">
                <Eye className="w-4.5 h-4.5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">View Public Profile</p>
                <p className="text-xs text-muted mt-0.5">See how clients see you</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-secondary transition-colors" />
            </button>
          </motion.div>

          {/* Available gigs */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Available Gigs</h2>
              <button className="text-xs text-primary hover:text-primary-light transition-colors font-medium">
                Browse all
              </button>
            </div>

            <div className="rounded-lg border border-border bg-surface overflow-hidden">
              {availableGigs.map((gig, i) => (
                <div
                  key={gig.title}
                  className={`flex items-center justify-between px-4 py-3.5 hover:bg-surface-elevated transition-colors ${
                    i < availableGigs.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{gig.title}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {gig.client} · Due in {gig.deadline}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs px-2 py-0.5 rounded bg-surface-elevated border border-border text-muted font-medium">
                      {gig.category}
                    </span>
                    <span className="text-sm font-semibold text-accent whitespace-nowrap">
                      {gig.budget} tok
                    </span>
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-semibold hover:bg-primary/20 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
