"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Users, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { SkeletonRow } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Gig } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function BrowseGigsPage() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(`${API}/api/skills/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.data)) setCategories(data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ limit: "50", page: "1" });
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        if (sort === "reward_high") params.set("sort", "reward_high");
        if (sort === "reward_low") params.set("sort", "reward_low");
        if (sort === "oldest") params.set("sort", "oldest");
        if (categoryId) params.set("category_id", categoryId);

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
  }, [searchQuery, sort, categoryId]);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 lg:py-14">
        <SectionHeading title="Browse gigs" kicker="Freelancer · Find work" />

        {/* Search + sort */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or client…"
              className="w-full pl-7 pr-8 h-11 bg-transparent border-0 border-b border-rule rounded-none text-[15px] text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-subtle hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="sm:w-56">
            <Select
              value={sort}
              onValueChange={setSort}
              ariaLabel="Sort gigs"
              boxed
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
                { value: "reward_high", label: "Highest reward" },
                { value: "reward_low", label: "Lowest reward" },
              ]}
            />
          </div>
        </div>

        {/* Category chips */}
        {categories.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategoryId("")}
              className={cn(
                "inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                categoryId === ""
                  ? "border-primary text-primary bg-primary/5"
                  : "border-rule text-muted hover:text-foreground hover:border-rule-strong"
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                  categoryId === c.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-rule text-muted hover:text-foreground hover:border-rule-strong"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : null}

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle tabular-nums">
          {gigs.length} gig{gigs.length !== 1 ? "s" : ""} available
        </p>

        {error && <p className="mt-4 text-sm text-error">{error}</p>}

        {loading && (
          <div className="mt-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {!loading && gigs.length === 0 && (
          <div className="mt-8">
            <EmptyState
              title="No gigs match your filters."
              description="Try clearing the category, broadening your search, or check back later."
            />
          </div>
        )}

        {!loading && gigs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mt-6 border-t border-rule"
          >
            {gigs.map((gig, idx) => (
              <motion.button
                key={gig.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: Math.min(idx * 0.04, 0.32),
                }}
                onClick={() => router.push(`/freelancer/gigs/${gig.id}`)}
                className="group w-full text-left grid grid-cols-12 gap-4 items-start py-5 border-b border-rule hover:bg-surface-elevated transition-colors px-2 -mx-2 rounded-sm"
              >
                <div className="col-span-12 md:col-span-8 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">
                      {gig.title}
                    </h3>
                    {gig.categoryName ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                        · {gig.categoryName}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[14px] text-muted line-clamp-2 leading-relaxed">
                    {gig.description}
                  </p>
                  <div className="mt-2 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                    <span className="truncate">by {gig.clientName}</span>
                    <span className="tabular-nums">
                      {new Date(gig.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Users className="w-3 h-3" />
                      {gig.proposalCount}
                    </span>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4 flex items-center justify-between md:justify-end gap-4">
                  <div className="text-right">
                    <span className="font-serif tabular-nums text-3xl text-accent">
                      {gig.tokenReward}
                    </span>
                    <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                      tok
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
