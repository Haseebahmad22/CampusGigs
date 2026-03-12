"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Clock,
  CheckCircle,
  Users,
  Search,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";

const placeholderGigs = [
  { title: "Design a Social Media Logo", status: "In Progress", budget: 50, freelancer: "Alex K." },
  { title: "Write a Blog Post", status: "Posted", budget: 30, freelancer: null },
  { title: "Build a Landing Page", status: "Completed", budget: 100, freelancer: "Sarah M." },
  { title: "Create Promotional Video", status: "Posted", budget: 75, freelancer: null },
];

const statusStyle: Record<string, string> = {
  Completed: "bg-success/10 text-success border-success/20",
  "In Progress": "bg-secondary/10 text-secondary border-secondary/20",
  Posted: "bg-primary/10 text-primary border-primary/20",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function ClientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Client");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("campusgigs_user") || "{}");
      setUserName(user.fullName || user.full_name || "Client");
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
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {firstName}
              </h1>
              <p className="text-sm text-muted mt-1">
                Manage your gigs and find talent
              </p>
            </div>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post Gig
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
            {[
              { label: "Active Gigs", value: "3", icon: Clock, color: "text-secondary", bg: "bg-secondary/8", border: "border-secondary/15" },
              { label: "Completed", value: "12", icon: CheckCircle, color: "text-success", bg: "bg-success/8", border: "border-success/15" },
              { label: "Freelancers Hired", value: "8", icon: Users, color: "text-primary", bg: "bg-primary/8", border: "border-primary/15" },
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
              onClick={() => router.push("/client/freelancers")}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface hover:border-primary/30 hover:bg-surface-elevated transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <Search className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Browse Freelancers</p>
                <p className="text-xs text-muted mt-0.5">Find skilled campus talent</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
            </button>

            <button
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface hover:border-secondary/30 hover:bg-surface-elevated transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/15 transition-colors">
                <UserCheck className="w-4.5 h-4.5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Hired Freelancers</p>
                <p className="text-xs text-muted mt-0.5">View and manage your talent</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-secondary transition-colors" />
            </button>
          </motion.div>

          {/* Gigs table */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Your Gigs</h2>
            </div>

            <div className="rounded-lg border border-border bg-surface overflow-hidden">
              {placeholderGigs.map((gig, i) => (
                <div
                  key={gig.title}
                  className={`flex items-center justify-between px-4 py-3.5 hover:bg-surface-elevated transition-colors ${
                    i < placeholderGigs.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{gig.title}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {gig.freelancer ? `Assigned to ${gig.freelancer}` : "Awaiting freelancer"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-sm font-semibold text-accent">
                      {gig.budget} tok
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium border ${statusStyle[gig.status]}`}>
                      {gig.status}
                    </span>
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
