// ─── CampusGigs Type Definitions ───

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "client" | "freelancer";
  createdAt: string;
}

export interface FreelancerProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  bio: string;
  headline: string;
  hourlyRate: number | null;
  avatarUrl: string | null;
  location: string;
  university: string;
  department: string;
  semester: string;
  languages: string[];
  availability: "available" | "busy" | "away" | "not_available";
  totalEarnings: number;
  totalJobsCompleted: number;
  averageRating: number;
  profileCompletionPct: number;
  skills: FreelancerSkill[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
}

export interface FreelancerSkill {
  id: string;
  skillId: string;
  skillName: string;
  categoryName: string;
  proficiencyLevel: "beginner" | "intermediate" | "expert";
}

export interface Review {
  id: string;
  clientName: string;
  clientAvatar: string | null;
  rating: number;
  comment: string;
  gigTitle: string;
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string | null;
}

export type AvailabilityStatus = FreelancerProfile["availability"];
