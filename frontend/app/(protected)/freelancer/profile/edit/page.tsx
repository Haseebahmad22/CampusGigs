"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Save,
  MapPin,
  GraduationCap,
  Languages,
  Coins,
  User,
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import type {
  FreelancerProfile,
  FreelancerSkill,
  AvailabilityStatus,
} from "@/lib/types";

const AVAILABILITY_OPTIONS: {
  value: AvailabilityStatus;
  label: string;
  dot: string;
}[] = [
  { value: "available", label: "Available", dot: "bg-success" },
  { value: "busy", label: "Busy", dot: "bg-warning" },
  { value: "away", label: "Away", dot: "bg-muted" },
  { value: "not_available", label: "Unavailable", dot: "bg-error" },
];

const LANGUAGES = [
  "English",
  "Urdu",
  "Hindi",
  "Arabic",
  "Chinese",
  "Spanish",
  "French",
  "German",
  "Punjabi",
  "Pashto",
  "Sindhi",
  "Balochi",
  "Bengali",
  "Turkish",
  "Persian",
  "Korean",
  "Japanese",
  "Portuguese",
  "Russian",
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

function ProfileArc({ pct }: { pct: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-rule"
      />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        className="text-primary"
      />
      <text
        x="36"
        y="40"
        textAnchor="middle"
        className="font-serif fill-foreground tabular-nums"
        style={{ fontSize: "16px" }}
      >
        {pct}%
      </text>
    </svg>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("campusgigs_token");
      if (!token) {
        router.replace("/signin");
        return;
      }

      try {
        setLoadingProfile(true);
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiBaseUrl}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
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
    <K extends keyof FreelancerProfile>(
      field: K,
      value: FreelancerProfile[K]
    ) => {
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

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
          headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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
          profile.fullName,
          profile.headline,
          profile.bio,
          profile.hourlyRate !== null && profile.hourlyRate !== undefined,
          profile.avatarUrl,
          profile.location,
          profile.university,
          profile.department,
          profile.semester,
          profile.languages.length > 0,
        ].filter(Boolean).length /
          10) *
          100
      )
    : 0;

  if (loadingProfile || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
          {error || "Loading…"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      {/* Floating save bar */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md border border-rule-strong bg-surface shadow-[0_2px_0_0_rgba(196,187,161,0.5)]">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/freelancer/profile/${profile.userId}`)
            }
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Button>
          <Button
            variant={saved ? "default" : "accent"}
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={saving}
          >
            {saved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save profile
              </>
            )}
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-10 lg:py-14 pb-32">
        <SectionHeading
          title="Edit profile"
          kicker="Freelancer · Build your reputation"
        />
        {error && <p className="mt-4 text-sm text-error">{error}</p>}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="mt-8 grid grid-cols-12 gap-6 lg:gap-8"
        >
          {/* Left rail */}
          <aside className="col-span-12 lg:col-span-3 space-y-5">
            {/* Avatar + completion */}
            <div className="rounded-md border border-border bg-surface p-5">
              <AvatarUpload
                currentUrl={profile.avatarUrl}
                userName={profile.fullName}
                onUpload={(url) => updateField("avatarUrl", url)}
                onRemove={() => updateField("avatarUrl", null)}
                size="lg"
              />
              <p className="mt-4 font-serif text-base text-foreground truncate">
                {profile.fullName}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle truncate">
                {profile.email}
              </p>
              <div className="mt-5 pt-5 border-t border-rule flex items-center gap-4 text-current">
                <ProfileArc pct={completionPct} />
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
                    Completion
                  </span>
                  <p className="text-[13px] text-muted leading-snug max-w-[10rem]">
                    {completionPct >= 80
                      ? "Profile is complete."
                      : "Finish profile to win more proposals."}
                  </p>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="rounded-md border border-border bg-surface p-5">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-subtle mb-3">
                Availability
              </span>
              <div className="space-y-1">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField("availability", opt.value)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-sm border text-[13px] transition-colors",
                      profile.availability === opt.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-transparent text-muted hover:text-foreground hover:bg-surface-elevated"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", opt.dot)} />
                    <span>{opt.label}</span>
                    {profile.availability === opt.value && (
                      <CheckCircle className="w-3 h-3 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="col-span-12 lg:col-span-9 min-w-0">
            <Tabs defaultValue="basics">
              <TabsList>
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="bio">Bio</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger
                  value="skills"
                  count={profile.skills.length}
                >
                  Skills
                </TabsTrigger>
              </TabsList>

              {/* Basics */}
              <TabsContent value="basics">
                <SectionHeading
                  title="Basic information"
                  kicker="Visible to clients"
                  as="h3"
                />
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) =>
                          updateField("fullName", e.target.value)
                        }
                        placeholder="Your full name"
                        icon={<User className="w-4 h-4" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="headline">Headline</Label>
                      <Input
                        id="headline"
                        value={profile.headline}
                        onChange={(e) =>
                          updateField("headline", e.target.value)
                        }
                        placeholder="e.g. Full-stack developer & UI designer"
                        icon={<Briefcase className="w-4 h-4" />}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) =>
                          updateField("location", e.target.value)
                        }
                        placeholder="City, country"
                        icon={<MapPin className="w-4 h-4" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate">Hourly rate (tokens)</Label>
                      <Input
                        id="rate"
                        type="number"
                        value={profile.hourlyRate ?? ""}
                        onChange={(e) =>
                          updateField(
                            "hourlyRate",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="25"
                        icon={<Coins className="w-4 h-4" />}
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Languages</Label>
                    {profile.languages.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {profile.languages.map((lang) => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-sm border border-rule bg-surface-elevated font-mono text-[10px] uppercase tracking-[0.12em] text-foreground"
                          >
                            {lang}
                            <button
                              type="button"
                              onClick={() => toggleLanguage(lang)}
                              className="text-subtle hover:text-foreground transition-colors"
                              aria-label={`Remove ${lang}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setLanguageDropdownOpen(!languageDropdownOpen)
                        }
                        className="w-full flex items-center justify-between px-0 py-2 border-0 border-b border-rule rounded-none text-[15px] text-muted hover:text-foreground hover:border-rule-strong transition-colors"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Languages className="w-4 h-4" />
                          Add languages…
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform",
                            languageDropdownOpen && "rotate-180"
                          )}
                        />
                      </button>
                      {languageDropdownOpen && (
                        <div className="absolute z-20 left-0 right-0 mt-1 rounded-md border border-rule-strong bg-surface shadow-[0_2px_0_0_rgba(196,187,161,0.5)] max-h-48 overflow-y-auto">
                          {LANGUAGES.filter(
                            (l) => !profile.languages.includes(l)
                          ).map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                toggleLanguage(lang);
                                setLanguageDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-[14px] text-foreground hover:bg-surface-elevated transition-colors"
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Bio */}
              <TabsContent value="bio">
                <SectionHeading
                  title="Bio & description"
                  kicker="Tell your story"
                  as="h3"
                />
                <div className="mt-6 max-w-3xl space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bio">Professional overview</Label>
                      <span
                        className={cn(
                          "font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums",
                          (profile.bio?.length || 0) > 2000
                            ? "text-error"
                            : "text-subtle"
                        )}
                      >
                        {profile.bio?.length || 0} / 2000
                      </span>
                    </div>
                    <Textarea
                      id="bio"
                      value={profile.bio ?? ""}
                      onChange={(e) => updateField("bio", e.target.value)}
                      placeholder="Describe yourself, your expertise, and what you bring to the table…"
                      rows={10}
                      maxLength={2000}
                    />
                  </div>
                  <div className="rounded-md border border-rule bg-surface-elevated/50 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                      Tip
                    </p>
                    <p className="mt-1 text-[13px] text-muted">
                      Profiles with detailed bios (300+ chars) get 3× more gig
                      offers.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Education */}
              <TabsContent value="education">
                <SectionHeading
                  title="Education"
                  kicker="Academic background"
                  as="h3"
                />
                <div className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={profile.university}
                        onChange={(e) =>
                          updateField("university", e.target.value)
                        }
                        placeholder="e.g. FAST-NUCES, LUMS, NUST"
                        icon={<GraduationCap className="w-4 h-4" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profile.department}
                        onChange={(e) =>
                          updateField("department", e.target.value)
                        }
                        placeholder="e.g. Computer Science, BBA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-xs">
                    <Label>Current semester</Label>
                    <Select
                      value={profile.semester}
                      onValueChange={(v) => updateField("semester", v)}
                      ariaLabel="Current semester"
                      boxed={false}
                      placeholder="Select semester"
                      options={SEMESTER_OPTIONS}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Skills */}
              <TabsContent value="skills">
                <SectionHeading
                  title="Skills & expertise"
                  kicker="Up to 15 skills"
                  as="h3"
                />
                <div className="mt-6">
                  <SkillsSelector
                    selectedSkills={profile.skills}
                    onSkillsChange={(skills: FreelancerSkill[]) =>
                      updateField("skills", skills)
                    }
                    maxSkills={15}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
