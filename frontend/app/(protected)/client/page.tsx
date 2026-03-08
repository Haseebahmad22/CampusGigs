"use client";

import { motion } from "framer-motion";
import { Briefcase, Plus, Clock, CheckCircle, Users, Coins } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

const placeholderGigs = [
  {
    title: "Design a Social Media Logo",
    status: "In Progress",
    budget: "50 tokens",
    freelancer: "Alex K.",
  },
  {
    title: "Write a Blog Post",
    status: "Posted",
    budget: "30 tokens",
    freelancer: null,
  },
  {
    title: "Build a Landing Page",
    status: "Completed",
    budget: "100 tokens",
    freelancer: "Sarah M.",
  },
];

const statusStyle: Record<string, string> = {
  Completed: "bg-success/10 text-success border-success/20",
  "In Progress": "bg-secondary/10 text-secondary border-secondary/20",
  Posted: "bg-primary/10 text-primary border-primary/20",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ClientDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="border-b border-border bg-surface/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground tracking-tight">
              CampusGigs
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Coins className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">
                250 tokens
              </span>
            </div>
            <LogoutButton />
            <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm cursor-pointer select-none">
              C
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-foreground">
              Client Dashboard
            </h1>
            <p className="text-muted mt-1">
              Manage your posted gigs and hired freelancers
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              {
                label: "Active Gigs",
                value: "3",
                icon: Clock,
                colorClass: "text-secondary",
                bgClass: "bg-secondary/10",
                borderClass: "border-secondary/20",
              },
              {
                label: "Completed",
                value: "12",
                icon: CheckCircle,
                colorClass: "text-success",
                bgClass: "bg-success/10",
                borderClass: "border-success/20",
              },
              {
                label: "Freelancers Hired",
                value: "8",
                icon: Users,
                colorClass: "text-primary",
                bgClass: "bg-primary/10",
                borderClass: "border-primary/20",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`p-5 rounded-2xl border ${stat.borderClass} ${stat.bgClass}`}
              >
                <div className="flex items-center gap-2.5">
                  <stat.icon className={`w-4 h-4 ${stat.colorClass}`} />
                  <span className="text-sm text-muted">{stat.label}</span>
                </div>
                <p className={`text-3xl font-bold mt-3 ${stat.colorClass}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Coming soon */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl bg-gradient-to-r from-primary/8 via-secondary/4 to-transparent border border-primary/15"
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">
              More features coming soon
            </h3>
            <p className="text-sm text-muted">
              Post new gigs, browse freelancer profiles, and manage token
              payments — all in one place.
            </p>
          </motion.div>

          {/* Gigs table */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-border bg-surface overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Your Gigs
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
                <Plus className="w-4 h-4" />
                Post Gig
              </button>
            </div>
            <div className="divide-y divide-border">
              {placeholderGigs.map((gig) => (
                <div
                  key={gig.title}
                  className="px-6 py-4 flex items-center justify-between hover:bg-surface-elevated transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{gig.title}</p>
                    <p className="text-sm text-muted mt-0.5">
                      {gig.freelancer
                        ? `Assigned to ${gig.freelancer}`
                        : "Awaiting freelancer"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-accent">
                      {gig.budget}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        statusStyle[gig.status]
                      }`}
                    >
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
