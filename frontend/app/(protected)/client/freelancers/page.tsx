"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  MapPin,
  GraduationCap,
  X,
  CheckCircle,
  SlidersHorizontal,
  Users,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FreelancerProfile } from "@/lib/types";

// ─── Dummy freelancers for browsing ───
const FREELANCERS: FreelancerProfile[] = [
  {
    id: "p1",
    userId: "u1",
    fullName: "Ayesha Khan",
    email: "ayesha@campus.edu",
    bio: "Full-stack developer and UI/UX enthusiast with 2+ years of experience building modern web applications. Currently pursuing BS Computer Science at FAST-NUCES.",
    headline: "Full-Stack Developer & UI/UX Designer",
    hourlyRate: 25,
    avatarUrl: null,
    location: "Islamabad, Pakistan",
    university: "FAST-NUCES",
    department: "Computer Science",
    semester: "6th Semester",
    languages: ["English", "Urdu"],
    availability: "available",
    totalEarnings: 1250,
    totalJobsCompleted: 18,
    averageRating: 4.9,
    profileCompletionPct: 92,
    skills: [
      { id: "1", skillId: "s1", skillName: "React", categoryName: "Web Development", proficiencyLevel: "expert" },
      { id: "2", skillId: "s2", skillName: "Next.js", categoryName: "Web Development", proficiencyLevel: "expert" },
      { id: "3", skillId: "s3", skillName: "TypeScript", categoryName: "Web Development", proficiencyLevel: "expert" },
      { id: "4", skillId: "s4", skillName: "Figma", categoryName: "Design & Creative", proficiencyLevel: "intermediate" },
      { id: "5", skillId: "s5", skillName: "Tailwind CSS", categoryName: "Web Development", proficiencyLevel: "expert" },
      { id: "50", skillId: "s50", skillName: "Node.js", categoryName: "Web Development", proficiencyLevel: "expert" },
    ],
    createdAt: "2025-09-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "p2",
    userId: "u2",
    fullName: "Ahmed Raza",
    email: "ahmed@campus.edu",
    bio: "Mobile app developer specializing in React Native and Flutter. Built 5+ published apps on Play Store. Available for cross-platform mobile projects.",
    headline: "Mobile App Developer (React Native & Flutter)",
    hourlyRate: 30,
    avatarUrl: null,
    location: "Lahore, Pakistan",
    university: "LUMS",
    department: "Computer Science",
    semester: "7th Semester",
    languages: ["English", "Urdu", "Punjabi"],
    availability: "available",
    totalEarnings: 890,
    totalJobsCompleted: 12,
    averageRating: 4.7,
    profileCompletionPct: 85,
    skills: [
      { id: "6", skillId: "s6", skillName: "React Native", categoryName: "Mobile Development", proficiencyLevel: "expert" },
      { id: "7", skillId: "s7", skillName: "Flutter", categoryName: "Mobile Development", proficiencyLevel: "intermediate" },
      { id: "8", skillId: "s8", skillName: "JavaScript", categoryName: "Web Development", proficiencyLevel: "expert" },
      { id: "9", skillId: "s9", skillName: "Firebase", categoryName: "DevOps & Cloud", proficiencyLevel: "intermediate" },
    ],
    createdAt: "2025-10-15T00:00:00Z",
    updatedAt: "2026-02-20T00:00:00Z",
  },
  {
    id: "p3",
    userId: "u3",
    fullName: "Sara Malik",
    email: "sara@campus.edu",
    bio: "Creative graphic designer and brand identity specialist. Expert in Adobe Creative Suite, Canva, and social media graphics. I bring brands to life through visual storytelling.",
    headline: "Graphic Designer & Brand Identity Specialist",
    hourlyRate: 20,
    avatarUrl: null,
    location: "Karachi, Pakistan",
    university: "NED University",
    department: "Design",
    semester: "5th Semester",
    languages: ["English", "Urdu"],
    availability: "busy",
    totalEarnings: 560,
    totalJobsCompleted: 22,
    averageRating: 4.8,
    profileCompletionPct: 90,
    skills: [
      { id: "10", skillId: "s10", skillName: "Adobe Photoshop", categoryName: "Design & Creative", proficiencyLevel: "expert" },
      { id: "11", skillId: "s11", skillName: "Adobe Illustrator", categoryName: "Design & Creative", proficiencyLevel: "expert" },
      { id: "12", skillId: "s12", skillName: "Logo Design", categoryName: "Design & Creative", proficiencyLevel: "expert" },
      { id: "13", skillId: "s13", skillName: "Brand Identity", categoryName: "Design & Creative", proficiencyLevel: "intermediate" },
      { id: "14", skillId: "s14", skillName: "Canva", categoryName: "Design & Creative", proficiencyLevel: "expert" },
    ],
    createdAt: "2025-08-20T00:00:00Z",
    updatedAt: "2026-03-05T00:00:00Z",
  },
  {
    id: "p4",
    userId: "u4",
    fullName: "Omar Hassan",
    email: "omar@campus.edu",
    bio: "Data science student with strong skills in Python, machine learning, and statistical analysis. Available for research data analysis, ML model building, and academic projects.",
    headline: "Data Scientist & ML Engineer",
    hourlyRate: 35,
    avatarUrl: null,
    location: "Islamabad, Pakistan",
    university: "NUST",
    department: "Data Science",
    semester: "8th Semester",
    languages: ["English", "Urdu", "Arabic"],
    availability: "available",
    totalEarnings: 1800,
    totalJobsCompleted: 15,
    averageRating: 5.0,
    profileCompletionPct: 95,
    skills: [
      { id: "15", skillId: "s15", skillName: "Python", categoryName: "Programming Languages", proficiencyLevel: "expert" },
      { id: "16", skillId: "s16", skillName: "Machine Learning", categoryName: "AI & Machine Learning", proficiencyLevel: "expert" },
      { id: "17", skillId: "s17", skillName: "TensorFlow", categoryName: "AI & Machine Learning", proficiencyLevel: "intermediate" },
      { id: "18", skillId: "s18", skillName: "Data Visualization", categoryName: "Data & Analytics", proficiencyLevel: "expert" },
      { id: "19", skillId: "s19", skillName: "SQL", categoryName: "Data & Analytics", proficiencyLevel: "expert" },
    ],
    createdAt: "2025-07-01T00:00:00Z",
    updatedAt: "2026-03-08T00:00:00Z",
  },
  {
    id: "p5",
    userId: "u5",
    fullName: "Fatima Noor",
    email: "fatima@campus.edu",
    bio: "Professional academic writer with expertise in research papers, essays, thesis writing, and SOP/LOR drafting. Also available for handwritten assignments and formatted lab reports.",
    headline: "Academic Writer & Research Assistant",
    hourlyRate: 15,
    avatarUrl: null,
    location: "Multan, Pakistan",
    university: "BZU Multan",
    department: "English Literature",
    semester: "4th Semester",
    languages: ["English", "Urdu", "Punjabi"],
    availability: "available",
    totalEarnings: 420,
    totalJobsCompleted: 30,
    averageRating: 4.6,
    profileCompletionPct: 80,
    skills: [
      { id: "20", skillId: "s20", skillName: "Academic Writing", categoryName: "Writing & Content", proficiencyLevel: "expert" },
      { id: "21", skillId: "s21", skillName: "Research Paper Writing", categoryName: "Writing & Content", proficiencyLevel: "expert" },
      { id: "22", skillId: "s22", skillName: "Essay Writing", categoryName: "Writing & Content", proficiencyLevel: "expert" },
      { id: "23", skillId: "s23", skillName: "Handwritten Assignments", categoryName: "Academic & University", proficiencyLevel: "expert" },
      { id: "24", skillId: "s24", skillName: "SOP/LOR Writing", categoryName: "Academic & University", proficiencyLevel: "intermediate" },
      { id: "25", skillId: "s25", skillName: "Proofreading & Editing", categoryName: "Writing & Content", proficiencyLevel: "expert" },
    ],
    createdAt: "2025-11-10T00:00:00Z",
    updatedAt: "2026-02-28T00:00:00Z",
  },
  {
    id: "p6",
    userId: "u6",
    fullName: "Bilal Tariq",
    email: "bilal@campus.edu",
    bio: "Video editor and motion graphics artist. Specializing in YouTube content, reels editing, and creative video production. 3+ years of freelancing experience.",
    headline: "Video Editor & Motion Graphics Artist",
    hourlyRate: 22,
    avatarUrl: null,
    location: "Rawalpindi, Pakistan",
    university: "COMSATS",
    department: "Media Sciences",
    semester: "6th Semester",
    languages: ["English", "Urdu"],
    availability: "available",
    totalEarnings: 670,
    totalJobsCompleted: 25,
    averageRating: 4.7,
    profileCompletionPct: 88,
    skills: [
      { id: "26", skillId: "s26", skillName: "Video Editing", categoryName: "Video & Animation", proficiencyLevel: "expert" },
      { id: "27", skillId: "s27", skillName: "Adobe Premiere Pro", categoryName: "Video & Animation", proficiencyLevel: "expert" },
      { id: "28", skillId: "s28", skillName: "Adobe After Effects", categoryName: "Video & Animation", proficiencyLevel: "intermediate" },
      { id: "29", skillId: "s29", skillName: "Reels/Shorts Editing", categoryName: "Video & Animation", proficiencyLevel: "expert" },
      { id: "30", skillId: "s30", skillName: "YouTube Thumbnails", categoryName: "Video & Animation", proficiencyLevel: "expert" },
    ],
    createdAt: "2025-09-20T00:00:00Z",
    updatedAt: "2026-03-06T00:00:00Z",
  },
];

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

  const filteredFreelancers = useMemo(() => {
    let results = [...FREELANCERS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (f) =>
          f.fullName.toLowerCase().includes(q) ||
          f.headline.toLowerCase().includes(q) ||
          f.bio.toLowerCase().includes(q) ||
          f.skills.some((s) => s.skillName.toLowerCase().includes(q)) ||
          f.university.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      results = results.filter((f) =>
        f.skills.some((s) => s.categoryName === selectedCategory)
      );
    }

    if (availabilityFilter !== "all") {
      results = results.filter((f) => f.availability === availabilityFilter);
    }

    switch (sortBy) {
      case "rating":
        results.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "jobs":
        results.sort((a, b) => b.totalJobsCompleted - a.totalJobsCompleted);
        break;
      case "rate_low":
        results.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
        break;
      case "rate_high":
        results.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
        break;
    }

    return results;
  }, [searchQuery, selectedCategory, sortBy, availabilityFilter]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    FREELANCERS.forEach((f) => f.skills.forEach((s) => cats.add(s.categoryName)));
    return Array.from(cats).sort();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      {/* Search Header */}
      <div className="border-b border-border bg-surface/40">
        <div className="max-w-5xl mx-auto px-5 pt-24 pb-6">
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
      <div className="max-w-5xl mx-auto px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            <span className="font-semibold text-foreground">
              {filteredFreelancers.length}
            </span>{" "}
            freelancer{filteredFreelancers.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {filteredFreelancers.length === 0 ? (
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
            {filteredFreelancers.map((freelancer) => {
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
