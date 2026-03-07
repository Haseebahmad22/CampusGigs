"use client";

import { motion } from "framer-motion";
import { Zap, Star, Clock, CheckCircle, TrendingUp, Coins, Search } from "lucide-react";

const availableGigs = [
  {
    title: "Design Social Media Graphics",
    client: "TechClub",
    budget: "40 tokens",
    category: "Design",
    deadline: "3 days",
  },
  {
    title: "Develop React Component",
    client: "StartupHub",
    budget: "80 tokens",
    category: "Dev",
    deadline: "5 days",
  },
  {
    title: "Edit Research Paper",
    client: "AcadSoc",
    budget: "25 tokens",
    category: "Writing",
    deadline: "2 days",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FreelancerDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="border-b border-border bg-surface/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground tracking-tight">
              CampusGigs
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Coins className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">
                180 tokens
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary font-bold text-sm cursor-pointer select-none">
              F
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
              Freelancer Dashboard
            </h1>
            <p className="text-muted mt-1">
              Browse gigs, track your work, and grow your campus reputation
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              {
                label: "Active Gigs",
                value: "2",
                icon: Clock,
                colorClass: "text-secondary",
                bgClass: "bg-secondary/10",
                borderClass: "border-secondary/20",
              },
              {
                label: "Completed",
                value: "7",
                icon: CheckCircle,
                colorClass: "text-success",
                bgClass: "bg-success/10",
                borderClass: "border-success/20",
              },
              {
                label: "Tokens Earned",
                value: "340",
                icon: TrendingUp,
                colorClass: "text-accent",
                bgClass: "bg-accent/10",
                borderClass: "border-accent/20",
              },
              {
                label: "Rating",
                value: "4.8",
                icon: Star,
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
            className="p-6 rounded-2xl bg-gradient-to-r from-secondary/8 via-primary/4 to-transparent border border-secondary/15"
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">
              More features coming soon
            </h3>
            <p className="text-sm text-muted">
              Browse full gig listings, apply instantly, track progress, and
              receive ratings — all in one place.
            </p>
          </motion.div>

          {/* Available gigs */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-border bg-surface overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Available Gigs
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated border border-border text-sm font-medium text-muted hover:text-foreground transition-colors">
                <Search className="w-4 h-4" />
                Browse All
              </button>
            </div>
            <div className="divide-y divide-border">
              {availableGigs.map((gig) => (
                <div
                  key={gig.title}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-surface-elevated transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{gig.title}</p>
                    <p className="text-sm text-muted mt-0.5">
                      Posted by {gig.client} &middot; Due in {gig.deadline}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                      {gig.category}
                    </span>
                    <span className="text-sm font-semibold text-accent">
                      {gig.budget}
                    </span>
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 font-semibold hover:bg-secondary/20 transition-colors">
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
