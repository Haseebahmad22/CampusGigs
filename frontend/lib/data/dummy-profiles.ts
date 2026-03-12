import type { FreelancerProfile, Review } from "@/lib/types";

// ─── Dummy freelancer profile for development ───

export function getCurrentUserProfile(): FreelancerProfile {
  const stored = typeof window !== "undefined" ? localStorage.getItem("campusgigs_user") : null;
  const user = stored ? JSON.parse(stored) : { id: "demo-user-1", fullName: "John Doe", email: "john@campus.edu" };

  return {
    id: "profile-1",
    userId: user.id || "demo-user-1",
    fullName: user.fullName || user.full_name || "John Doe",
    email: user.email || "john@campus.edu",
    bio: "",
    headline: "",
    hourlyRate: null,
    avatarUrl: null,
    location: "",
    university: "",
    department: "",
    semester: "",
    languages: [],
    availability: "available",
    totalEarnings: 340,
    totalJobsCompleted: 7,
    averageRating: 4.8,
    profileCompletionPct: 25,
    skills: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const DUMMY_REVIEWS: Review[] = [
  {
    id: "rev-1",
    clientName: "TechClub Society",
    clientAvatar: null,
    rating: 5,
    comment: "Excellent work on the event website! Delivered ahead of schedule with great attention to detail. Would definitely hire again.",
    gigTitle: "Build Event Landing Page",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "rev-2",
    clientName: "Dr. Sarah Ahmed",
    clientAvatar: null,
    rating: 4.5,
    comment: "Very professional and responsive. The data analysis report was thorough and well-structured.",
    gigTitle: "Data Analysis for Research Project",
    createdAt: "2026-01-28T14:30:00Z",
  },
  {
    id: "rev-3",
    clientName: "StartupHub",
    clientAvatar: null,
    rating: 5,
    comment: "Fantastic React components! Clean code, well-documented, and pixel-perfect implementation.",
    gigTitle: "Develop React Dashboard Components",
    createdAt: "2026-01-10T09:00:00Z",
  },
];

// Sample populated profile (for public profile view demo)
export const SAMPLE_FREELANCER: FreelancerProfile = {
  id: "profile-sample-1",
  userId: "user-sample-1",
  fullName: "Ayesha Khan",
  email: "ayesha@campus.edu",
  bio: "Full-stack developer and UI/UX enthusiast with 2+ years of experience building modern web applications. Currently pursuing BS Computer Science at FAST-NUCES. Passionate about clean code, responsive design, and creating delightful user experiences. I specialize in React, Next.js, and Node.js ecosystems.\n\nI've worked with student organizations, startups, and professors on various projects ranging from event platforms to research tools. I believe great software starts with understanding the user's needs.",
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
    { id: "fs-1", skillId: "skill-5", skillName: "React", categoryName: "Web Development", proficiencyLevel: "expert" },
    { id: "fs-2", skillId: "skill-6", skillName: "Next.js", categoryName: "Web Development", proficiencyLevel: "expert" },
    { id: "fs-3", skillId: "skill-4", skillName: "TypeScript", categoryName: "Web Development", proficiencyLevel: "expert" },
    { id: "fs-4", skillId: "skill-10", skillName: "Node.js", categoryName: "Web Development", proficiencyLevel: "intermediate" },
    { id: "fs-5", skillId: "skill-18", skillName: "Tailwind CSS", categoryName: "Web Development", proficiencyLevel: "expert" },
    { id: "fs-6", skillId: "skill-37", skillName: "Figma", categoryName: "Design & Creative", proficiencyLevel: "intermediate" },
    { id: "fs-7", skillId: "skill-35", skillName: "UI Design", categoryName: "Design & Creative", proficiencyLevel: "intermediate" },
    { id: "fs-8", skillId: "skill-36", skillName: "UX Design", categoryName: "Design & Creative", proficiencyLevel: "beginner" },
  ],
  createdAt: "2025-09-01T00:00:00Z",
  updatedAt: "2026-03-01T00:00:00Z",
};
