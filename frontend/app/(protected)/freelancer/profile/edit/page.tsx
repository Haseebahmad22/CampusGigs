"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Save,
  MapPin,
  GraduationCap,
  Languages,
  DollarSign,
  User,
  FileText,
  Briefcase,
  CheckCircle,
  Eye,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { SkillsSelector } from "@/components/profile/SkillsSelector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { FreelancerProfile, FreelancerSkill, AvailabilityStatus } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "available", label: "Available", color: "text-success" },
  { value: "busy", label: "Busy", color: "text-warning" },
  { value: "away", label: "Away", color: "text-muted" },
  { value: "not_available", label: "Not Available", color: "text-error" },
];

const LANGUAGES = [
  "English", "Urdu", "Hindi", "Arabic", "Chinese", "Spanish", "French",
  "German", "Punjabi", "Pashto", "Sindhi", "Balochi", "Bengali",
  "Turkish", "Persian", "Korean", "Japanese", "Portuguese", "Russian",
];

const SEMESTER_OPTIONS = [
  { value: "", label: "Select semester" },
  { value: "1st Semester", label: "1st Semester" },
  { value: "2nd Semester", label: "2nd Semester" },
  { value: "3rd Semester", label: "3rd Semester" },
  { value: "4th Semester", label: "4th Semester" },
  { value: "5th Semester", label: "5th Semester" },
  { value: "6th Semester", label: "6th Semester" },
  { value: "7th Semester", label: "7th Semester" },
  { value: "8th Semester", label: "8th Semester" },
  { value: "Graduated", label: "Graduated" },
  { value: "Masters", label: "Masters" },
  { value: "PhD", label: "PhD" },
];

type Section = "basic" | "bio" | "education" | "skills";

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("basic");
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [semesterOpen, setSemesterOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("campusgigs_token");

      if (!token) {
        router.replace("/signin");
        return;
      }

      try {
        setLoadingProfile(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiBaseUrl}/api/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error || "Unable to load your profile.");
          return;
        }

        setProfile(payload as FreelancerProfile);
      } catch {
        setError("Unable to connect to backend. Please try again.");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [router]);

  const updateField = useCallback(
    <K extends keyof FreelancerProfile>(field: K, value: FreelancerProfile[K]) => {
      setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
      setSaved(false);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!profile) return;

    const token = localStorage.getItem("campusgigs_token");
    if (!token) {
      router.replace("/signin");
      return;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    setSaving(true);
    setError("");

    try {
      const updateProfileRes = await fetch(`${apiBaseUrl}/api/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          headline: profile.headline,
          bio: profile.bio,
          hourlyRate: profile.hourlyRate,
          location: profile.location,
          university: profile.university,
          department: profile.department,
          semester: profile.semester,
          languages: profile.languages,
          availability: profile.availability,
        }),
      });

      const updatePayload = await updateProfileRes.json();

      if (!updateProfileRes.ok) {
        setError(updatePayload?.error || "Failed to save profile.");
        return;
      }

      const avatarEndpoint = `${apiBaseUrl}/api/profile/me/avatar`;
      if (profile.avatarUrl) {
        await fetch(avatarEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatarUrl: profile.avatarUrl }),
        });
      } else {
        await fetch(avatarEndpoint, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (profile.skills.length > 0) {
        await fetch(`${apiBaseUrl}/api/profile/me/skills`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            skills: profile.skills.map((skill) => ({
              skillId: skill.skillId,
              proficiencyLevel: skill.proficiencyLevel,
            })),
          }),
        });
      }

      const refreshed = await fetch(`${apiBaseUrl}/api/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (refreshed.ok) {
        const refreshedPayload = await refreshed.json();
        setProfile(refreshedPayload as FreelancerProfile);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Unable to save profile. Please check backend and try again.");
    } finally {
      setSaving(false);
    }
  }, [profile, router]);

  const toggleLanguage = useCallback(
    (lang: string) => {
      if (!profile) return;
      const langs = profile.languages.includes(lang)
        ? profile.languages.filter((l) => l !== lang)
        : [...profile.languages, lang];
      updateField("languages", langs);
    },
    [profile, updateField]
  );

  const completionPct = profile
    ? Math.round(
      ([
        profile.headline,
        profile.bio,
        profile.avatarUrl,
        profile.location,
        profile.university,
        profile.hourlyRate,
        profile.languages.length > 0,
        profile.skills.length > 0,
        profile.department,
        profile.semester,
      ].filter(Boolean).length / 10) * 100
    )
    : 0;

  if (loadingProfile || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          {error && <p className="text-sm text-error">{error}</p>}
        </div>
      </div>
    );
  }

  const sections: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "bio", label: "Bio & Headline", icon: FileText },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      {/* Floating save bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{
            background: "rgba(12,12,21,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/freelancer/profile/${profile.userId}`)}
            className="h-8"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Preview
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={saving}
            className="h-8"
          >
            {saved ? (
              <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Saved</>
            ) : (
              <><Save className="w-3.5 h-3.5 mr-1.5" />Save Profile</>
            )}
          </Button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 pt-24 pb-24">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Page header */}
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-muted mt-1 text-sm">
              Build your professional profile to attract clients
            </p>
            {error && <p className="text-sm text-error mt-2">{error}</p>}
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar */}
            <motion.div variants={itemVariants} className="lg:w-64 shrink-0 space-y-4">
              {/* Profile card */}
              <div className="p-4 rounded-lg border border-border bg-surface">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-primary/30">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-foreground/80">
                        {profile.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{profile.fullName}</p>
                    <p className="text-xs text-muted truncate">{profile.email}</p>
                  </div>
                </div>

                {/* Completion bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Completion</span>
                    <span className={cn("font-semibold", completionPct >= 80 ? "text-success" : completionPct >= 50 ? "text-warning" : "text-error")}>
                      {completionPct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", completionPct >= 80 ? "bg-success" : completionPct >= 50 ? "bg-warning" : "bg-error")}
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Section nav */}
              <div className="rounded-lg border border-border bg-surface overflow-hidden">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-4 py-3 text-left transition-all border-l-2 text-sm",
                      activeSection === section.id
                        ? "bg-primary/5 border-primary text-foreground font-medium"
                        : "border-transparent text-muted hover:text-foreground hover:bg-surface-elevated"
                    )}
                  >
                    <section.icon className="w-4 h-4 shrink-0" />
                    {section.label}
                  </button>
                ))}
              </div>

              {/* Availability */}
              <div className="p-4 rounded-lg border border-border bg-surface">
                <p className="text-xs font-medium text-muted mb-2.5">Availability</p>
                <div className="space-y-1">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField("availability", opt.value)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                        profile.availability === opt.value
                          ? "bg-surface-elevated border border-primary/25"
                          : "hover:bg-surface-elevated border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        opt.value === "available" && "bg-success",
                        opt.value === "busy" && "bg-warning",
                        opt.value === "away" && "bg-muted",
                        opt.value === "not_available" && "bg-error"
                      )} />
                      <span className={cn("font-medium", opt.color)}>{opt.label}</span>
                      {profile.availability === opt.value && (
                        <CheckCircle className="w-3 h-3 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Main content */}
            <motion.div variants={itemVariants} className="flex-1 min-w-0">
              <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
                {/* Basic Info */}
                {activeSection === "basic" && (
                  <motion.div key="basic" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Basic Information</h2>
                      <p className="text-sm text-muted mt-0.5">Your personal details visible to clients</p>
                    </div>

                    {/* Avatar */}
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      <AvatarUpload
                        currentUrl={profile.avatarUrl}
                        userName={profile.fullName}
                        onUpload={(url) => updateField("avatarUrl", url)}
                        onRemove={() => updateField("avatarUrl", null)}
                        size="lg"
                      />
                      <div className="flex-1 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">Profile Photo</h3>
                        <p className="text-xs text-muted leading-relaxed">
                          Upload a professional photo. JPG, PNG or WebP, max 5MB.
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Name + Headline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Full Name</label>
                        <Input value={profile.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="Your full name" icon={<User className="w-4 h-4" />} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Professional Headline</label>
                        <Input value={profile.headline} onChange={(e) => updateField("headline", e.target.value)} placeholder="e.g. Full-Stack Developer & UI Designer" icon={<Briefcase className="w-4 h-4" />} />
                        <p className="text-xs text-muted">Appears below your name</p>
                      </div>
                    </div>

                    {/* Location + Rate */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Location</label>
                        <Input value={profile.location} onChange={(e) => updateField("location", e.target.value)} placeholder="City, Country" icon={<MapPin className="w-4 h-4" />} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Hourly Rate (tokens)</label>
                        <Input type="number" value={profile.hourlyRate ?? ""} onChange={(e) => updateField("hourlyRate", e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 25" icon={<DollarSign className="w-4 h-4" />} min={0} />
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Languages</label>
                      {profile.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {profile.languages.map((lang) => (
                            <span key={lang} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full border border-border bg-surface-elevated text-xs text-foreground">
                              {lang}
                              <button type="button" onClick={() => toggleLanguage(lang)} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-border transition-colors">
                                <span className="text-muted text-xs">x</span>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-surface text-sm text-muted hover:border-primary/40 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Languages className="w-4 h-4" />
                            Add languages...
                          </span>
                          <ChevronDown className={cn("w-4 h-4 transition-transform", languageDropdownOpen && "rotate-180")} />
                        </button>
                        {languageDropdownOpen && (
                          <div className="absolute z-20 w-full mt-1 rounded-lg border border-border bg-surface-elevated shadow-xl max-h-48 overflow-y-auto">
                            {LANGUAGES.filter((l) => !profile.languages.includes(l)).map((lang) => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => { toggleLanguage(lang); setLanguageDropdownOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 transition-colors"
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Bio */}
                {activeSection === "bio" && (
                  <motion.div key="bio" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Bio & Description</h2>
                      <p className="text-sm text-muted mt-0.5">Tell clients about yourself and your experience</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Professional Overview</label>
                        <span className={cn("text-xs", (profile.bio?.length || 0) > 2000 ? "text-error" : "text-muted")}>
                          {profile.bio?.length || 0}/2000
                        </span>
                      </div>
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => updateField("bio", e.target.value)}
                        placeholder="Describe yourself, your expertise, and what you bring to the table..."
                        rows={8}
                        maxLength={2000}
                      />
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted leading-relaxed">
                          <strong className="text-foreground">Tip:</strong>{" "}
                          Profiles with detailed bios (300+ chars) get 3x more gig offers.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Education */}
                {activeSection === "education" && (
                  <motion.div key="education" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Education Details</h2>
                      <p className="text-sm text-muted mt-0.5">Help clients understand your academic background</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">University</label>
                        <Input value={profile.university} onChange={(e) => updateField("university", e.target.value)} placeholder="e.g. FAST-NUCES, LUMS, NUST" icon={<GraduationCap className="w-4 h-4" />} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Department / Major</label>
                        <Input value={profile.department} onChange={(e) => updateField("department", e.target.value)} placeholder="e.g. Computer Science, BBA" />
                      </div>
                    </div>

                    {/* Custom semester dropdown */}
                    <div className="space-y-1.5 max-w-xs">
                      <label className="text-sm font-medium text-foreground">Current Semester</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setSemesterOpen(!semesterOpen)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border bg-surface text-sm transition-colors",
                            semesterOpen ? "border-primary/50 ring-2 ring-primary/20" : "border-border hover:border-primary/40",
                            profile.semester ? "text-foreground" : "text-muted"
                          )}
                        >
                          <span>{profile.semester || "Select semester"}</span>
                          <ChevronDown className={cn("w-4 h-4 text-muted transition-transform", semesterOpen && "rotate-180")} />
                        </button>
                        {semesterOpen && (
                          <div className="absolute z-20 w-full mt-1 rounded-lg border border-border bg-surface-elevated shadow-xl max-h-56 overflow-y-auto">
                            {SEMESTER_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => { updateField("semester", opt.value); setSemesterOpen(false); }}
                                className={cn(
                                  "w-full text-left px-4 py-2.5 text-sm transition-colors",
                                  profile.semester === opt.value ? "bg-primary/5 text-primary font-medium" : "text-foreground hover:bg-primary/5"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Skills */}
                {activeSection === "skills" && (
                  <motion.div key="skills" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Skills & Expertise</h2>
                      <p className="text-sm text-muted mt-0.5">Select up to 15 skills that represent what you offer</p>
                    </div>
                    <SkillsSelector
                      selectedSkills={profile.skills}
                      onSkillsChange={(skills: FreelancerSkill[]) => updateField("skills", skills)}
                      maxSkills={15}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
