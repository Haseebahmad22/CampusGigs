"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  MapPin,
  GraduationCap,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import type { FreelancerProfile } from "@/lib/types";

export default function BrowseFreelancersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "rating" | "jobs" | "rate_low" | "rate_high"
  >("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiBaseUrl}/api/skills/categories`);
        const payload = await response.json();

        if (response.ok && Array.isArray(payload?.data)) {
          setCategories(payload.data.map((cat: { name: string }) => cat.name));
        }
      } catch {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const params = new URLSearchParams({
          sort: sortBy,
          page: "1",
          limit: "50",
        });

        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }

        if (selectedCategory) {
          params.set("category", selectedCategory);
        }

        if (availabilityFilter !== "all") {
          params.set("availability", availabilityFilter);
        }

        const response = await fetch(
          `${apiBaseUrl}/api/freelancers?${params.toString()}`
        );
        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error || "Unable to load freelancers.");
          setFreelancers([]);
          return;
        }

        setFreelancers(Array.isArray(payload?.data) ? payload.data : []);
      } catch {
        setError("Unable to connect to backend. Please try again.");
        setFreelancers([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [availabilityFilter, searchQuery, selectedCategory, sortBy]);

  const activeFilterCount = [
    selectedCategory,
    availabilityFilter !== "all" ? availabilityFilter : null,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 lg:py-14">
        {/* Header */}
        <SectionHeading title="Find talent" kicker="Client area · Discover" />

        {/* Search bar + filter toggle */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill, or university…"
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
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "border-primary text-primary")}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex w-5 h-5 items-center justify-center rounded-sm bg-primary text-[#F7F4EC] font-mono text-[10px] tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-md border border-rule bg-surface-elevated/40 p-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  ariaLabel="Category"
                  options={[
                    { value: "", label: "All categories" },
                    ...categories.map((cat) => ({
                      value: cat,
                      label: cat,
                    })),
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort by</Label>
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as typeof sortBy)}
                  ariaLabel="Sort by"
                  options={[
                    { value: "rating", label: "Highest rating" },
                    { value: "jobs", label: "Most jobs" },
                    { value: "rate_low", label: "Rate: low to high" },
                    { value: "rate_high", label: "Rate: high to low" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={availabilityFilter}
                  onValueChange={setAvailabilityFilter}
                  ariaLabel="Availability"
                  options={[
                    { value: "all", label: "All" },
                    { value: "available", label: "Available now" },
                    { value: "busy", label: "Busy" },
                  ]}
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                  Active
                </span>
                {selectedCategory && (
                  <Badge variant="primary">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="ml-1.5"
                      aria-label={`Remove ${selectedCategory}`}
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {availabilityFilter !== "all" && (
                  <Badge variant="success">
                    {availabilityFilter}
                    <button
                      onClick={() => setAvailabilityFilter("all")}
                      className="ml-1.5"
                      aria-label="Clear availability"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setAvailabilityFilter("all");
                  }}
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-error hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Result count */}
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle tabular-nums">
          {freelancers.length} freelancer{freelancers.length !== 1 ? "s" : ""}
        </p>

        {error && <p className="mt-4 text-sm text-error">{error}</p>}

        {loading && (
          <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
            Loading…
          </p>
        )}

        {!loading && freelancers.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No freelancers found."
              description="Try adjusting your search or filters."
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {freelancers.map((freelancer, idx) => (
              <motion.button
                key={freelancer.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: Math.min(idx * 0.04, 0.32),
                }}
                onClick={() =>
                  router.push(`/freelancer/profile/${freelancer.userId}`)
                }
                className="group text-left rounded-md border border-border bg-surface p-5 hover:border-rule-strong hover:bg-surface-elevated transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <Avatar
                      src={freelancer.avatarUrl}
                      fallback={freelancer.fullName}
                      size="lg"
                      variant="square"
                      verified={freelancer.profileCompletionPct >= 80}
                    />
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-surface",
                        freelancer.availability === "available" && "bg-success",
                        freelancer.availability === "busy" && "bg-warning",
                        freelancer.availability === "away" && "bg-muted",
                        freelancer.availability === "not_available" && "bg-error"
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                      {freelancer.fullName}
                    </h3>
                    <p className="mt-1 text-[13px] text-muted line-clamp-1">
                      {freelancer.headline}
                    </p>
                    {freelancer.hourlyRate ? (
                      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                        <span className="text-foreground tabular-nums">
                          {freelancer.hourlyRate}
                        </span>{" "}
                        tok / hr
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-rule flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="text-foreground tabular-nums">
                      {freelancer.averageRating.toFixed(1)}
                    </span>
                    <span className="tabular-nums">
                      ({freelancer.totalJobsCompleted})
                    </span>
                  </span>
                  {freelancer.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {freelancer.location}
                    </span>
                  )}
                  {freelancer.university && (
                    <span className="inline-flex items-center gap-1 truncate">
                      <GraduationCap className="w-3 h-3" />
                      <span className="truncate">{freelancer.university}</span>
                    </span>
                  )}
                </div>

                <p className="mt-3 text-[13px] text-muted line-clamp-2 leading-relaxed">
                  {freelancer.bio}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {freelancer.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill.id}
                      className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted border border-rule rounded-sm px-1.5 py-0.5"
                    >
                      {skill.skillName}
                    </span>
                  ))}
                  {freelancer.skills.length > 4 && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary border border-primary/40 rounded-sm px-1.5 py-0.5">
                      +{freelancer.skills.length - 4}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
