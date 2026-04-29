"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Coins, Clock, Users, X, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import type { Gig } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function BrowseGigsPage() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ limit: "50", page: "1" });
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        if (sort === "reward_high") params.set("sort", "reward_high");
        if (sort === "reward_low") params.set("sort", "reward_low");
        if (sort === "oldest") params.set("sort", "oldest");

        const res = await fetch(`${API}/api/gigs?${params}`);
        const data = await res.json();
        if (Array.isArray(data?.data)) setGigs(data.data);
        else setError(data?.error || "Failed to load gigs.");
      } catch {
        setError("Unable to connect to backend.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery, sort]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      {/* Search header */}
      <div className="border-b border-border bg-surface/40">
        <div className="max-w-none mx-auto px-5 pt-24 pb-5">
          <div className="flex items-center gap-3 mb-1">
            <Briefcase className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Browse Gigs</h1>
          </div>
          <p className="text-muted text-sm mb-4">Find work that matches your skills</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or client..."
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-elevated flex items-center justify-center hover:bg-border transition-colors"
                >
                  <X className="w-3 h-3 text-muted" />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="reward_high">Highest Reward</option>
              <option value="reward_low">Lowest Reward</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-none mx-auto px-5 py-5">
        <p className="text-sm text-muted mb-4">
          <span className="font-semibold text-foreground">{gigs.length}</span> gig{gigs.length !== 1 ? "s" : ""} available
        </p>

        {error && <p className="text-sm text-error mb-3">{error}</p>}

        {loading && (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!loading && gigs.length === 0 && (
          <div className="py-20 text-center">
            <Briefcase className="w-10 h-10 text-muted/30 mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground">No gigs found</p>
            <p className="text-sm text-muted mt-1">Try adjusting your search</p>
          </div>
        )}

        {!loading && gigs.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {gigs.map((gig) => (
              <motion.div
                key={gig.id}
                variants={cardVariants}
                onClick={() => router.push(`/freelancer/gigs/${gig.id}`)}
                className="rounded-lg border border-border bg-surface p-5 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {gig.title}
                    </h3>
                    <p className="text-sm text-muted mt-1 line-clamp-2 leading-relaxed">
                      {gig.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2.5 text-xs text-muted">
                      <span>by {gig.clientName}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(gig.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {gig.proposalCount} proposal{gig.proposalCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-bold text-accent">{gig.tokenReward}</span>
                    <span className="text-xs text-muted ml-0.5">tok</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
