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
  Users,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FreelancerProfile } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function BrowseFreelancersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"rating" | "jobs" | "rate_low" | "rate_high">("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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

        const response = await fetch(`${apiBaseUrl}/api/freelancers?${params.toString()}`);
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

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      {/* Search Header */}
      <div className="border-b border-border bg-surface/40">
        <div className="max-w-none mx-auto px-5 pt-24 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <Users className="w-5 h-5 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Find Talent
              </h1>
            </div>
            <p className="text-muted text-sm mb-5">
              Browse verified campus freelancers ready to work on your project
            </p>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skill, or university..."
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
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowFilters(!showFilters)}
                className={cn("shrink-0", showFilters && "border-primary/50 text-primary")}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {(selectedCategory || availabilityFilter !== "all") && (
                  <span className="ml-1.5 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                    {[selectedCategory, availabilityFilter !== "all"].filter(Boolean).length}
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
                className="mt-4 p-4 rounded-xl border border-border bg-surface space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-medium text-muted">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-elevated text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-medium text-muted">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-elevated text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    >
                      <option value="rating">Highest Rating</option>
                      <option value="jobs">Most Jobs Completed</option>
                      <option value="rate_low">Rate: Low to High</option>
                      <option value="rate_high">Rate: High to Low</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-medium text-muted">Availability</label>
                    <select
                      value={availabilityFilter}
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface-elevated text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    >
                      <option value="all">All</option>
                      <option value="available">Available Now</option>
                      <option value="busy">Busy</option>
                    </select>
                  </div>
                </div>

                {(selectedCategory || availabilityFilter !== "all") && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted">Active:</span>
                    {selectedCategory && (
                      <Badge variant="primary" size="sm">
                        {selectedCategory}
                        <button onClick={() => setSelectedCategory("")} className="ml-1">
                          x
                        </button>
                      </Badge>
                    )}
                    {availabilityFilter !== "all" && (
                      <Badge variant="success" size="sm">
                        {availabilityFilter}
                        <button onClick={() => setAvailabilityFilter("all")} className="ml-1">
                          x
                        </button>
                      </Badge>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setAvailabilityFilter("all");
                      }}
                      className="text-xs text-error hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-none mx-auto px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            <span className="font-semibold text-foreground">
              {freelancers.length}
            </span>{" "}
            freelancer{freelancers.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {error && <p className="text-sm text-error mb-3">{error}</p>}

        {loading && (
          <div className="py-10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!loading && freelancers.length === 0 ? (
          <div className="py-20 text-center">
            <Search className="w-10 h-10 text-muted/30 mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground">No freelancers found</p>
            <p className="text-sm text-muted mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {freelancers.map((freelancer) => {
              const initials = freelancer.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <motion.div
                  key={freelancer.id}
                  variants={cardVariants}
                  className="rounded-lg border border-border bg-surface hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
                  onClick={() =>
                    router.push(`/freelancer/profile/${freelancer.userId}`)
                  }
                >
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="shrink-0">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-linear-to-br from-primary/15 via-accent/15 to-secondary/15">
                          {freelancer.avatarUrl ? (
                            <img
                              src={freelancer.avatarUrl}
                              alt={freelancer.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-lg font-bold text-foreground/60">
                                {initials}
                              </span>
                            </div>
                          )}
                          {/* Availability dot */}
                          <div
                            className={cn(
                              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface",
                              freelancer.availability === "available" && "bg-success",
                              freelancer.availability === "busy" && "bg-warning",
                              freelancer.availability === "away" && "bg-muted",
                              freelancer.availability === "not_available" && "bg-error"
                            )}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                {freelancer.fullName}
                              </h3>
                              {freelancer.profileCompletionPct >= 80 && (
                                <Shield className="w-3.5 h-3.5 text-secondary" />
                              )}
                            </div>
                            <p className="text-sm text-muted mt-0.5">
                              {freelancer.headline}
                            </p>
                          </div>

                          {/* Rate */}
                          {freelancer.hourlyRate && (
                            <div className="text-right shrink-0">
                              <span className="text-base font-bold text-primary">
                                {freelancer.hourlyRate} tok
                              </span>
                              <span className="text-xs text-muted">/hr</span>
                            </div>
                          )}
                        </div>

                        {/* Rating + Meta */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-warning fill-warning" />
                            <span className="font-bold text-foreground">
                              {freelancer.averageRating.toFixed(1)}
                            </span>
                            ({freelancer.totalJobsCompleted} jobs)
                          </span>
                          {freelancer.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {freelancer.location}
                            </span>
                          )}
                          {freelancer.university && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {freelancer.university}
                            </span>
                          )}
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-muted mt-2 line-clamp-2 leading-relaxed">
                          {freelancer.bio}
                        </p>

                        {/* Skills - Upwork-style flat pills */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {freelancer.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill.id}
                              className="px-2.5 py-1 rounded-full bg-surface-elevated border border-border text-xs text-muted hover:text-foreground transition-colors"
                            >
                              {skill.skillName}
                            </span>
                          ))}
                          {freelancer.skills.length > 5 && (
                            <span className="px-2.5 py-1 rounded-full bg-primary/5 border border-primary/15 text-xs font-medium text-primary">
                              +{freelancer.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
