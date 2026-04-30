"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORIES, searchSkills, ALL_SKILLS } from "@/lib/data/skills";
import type { FreelancerSkill } from "@/lib/types";

const PROFICIENCY_OPTIONS: {
  value: FreelancerSkill["proficiencyLevel"];
  short: string;
  label: string;
}[] = [
  { value: "beginner", short: "BGN", label: "Beginner" },
  { value: "intermediate", short: "INT", label: "Intermediate" },
  { value: "expert", short: "EXP", label: "Expert" },
];

function ProficiencyPicker({
  value,
  onChange,
}: {
  value: FreelancerSkill["proficiencyLevel"];
  onChange: (v: FreelancerSkill["proficiencyLevel"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = PROFICIENCY_OPTIONS.find((o) => o.value === value)!;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Proficiency level"
        className="flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle hover:text-foreground transition-colors"
      >
        {current.short}
        <ChevronDown
          className={cn("size-2.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1.5 w-32 overflow-hidden rounded-md border border-rule-strong bg-surface p-1 shadow-[0_2px_0_0_rgba(196,187,161,0.5)]"
        >
          {PROFICIENCY_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-1.5 text-xs transition-colors",
                  isSelected
                    ? "bg-surface-elevated text-foreground font-medium"
                    : "text-foreground hover:bg-surface-elevated"
                )}
              >
                <span>{opt.label}</span>
                {isSelected ? <Check className="size-3 text-primary" /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

interface SkillsSelectorProps {
  selectedSkills: FreelancerSkill[];
  onSkillsChange: (skills: FreelancerSkill[]) => void;
  maxSkills?: number;
}

export function SkillsSelector({
  selectedSkills,
  onSkillsChange,
  maxSkills = 15,
}: SkillsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [activeTab, setActiveTab] = useState<"browse" | "search">("browse");

  const selectedIds = useMemo(
    () => new Set(selectedSkills.map((s) => s.skillId)),
    [selectedSkills]
  );

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchSkills(searchQuery).slice(0, 30);
  }, [searchQuery]);

  const toggleCategory = useCallback((catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, []);

  const toggleSkill = useCallback(
    (skillId: string) => {
      if (selectedIds.has(skillId)) {
        onSkillsChange(selectedSkills.filter((s) => s.skillId !== skillId));
      } else if (selectedSkills.length < maxSkills) {
        const skill = ALL_SKILLS.find((s) => s.slug === skillId);
        if (!skill) return;
        onSkillsChange([
          ...selectedSkills,
          {
            id: `fs-${Date.now()}-${skillId}`,
            skillId: skill.slug,
            skillName: skill.name,
            categoryName: skill.categoryName,
            proficiencyLevel: "intermediate",
          },
        ]);
      }
    },
    [selectedIds, selectedSkills, onSkillsChange, maxSkills]
  );

  const removeSkill = useCallback(
    (skillId: string) => {
      onSkillsChange(selectedSkills.filter((s) => s.skillId !== skillId));
    },
    [selectedSkills, onSkillsChange]
  );

  const updateProficiency = useCallback(
    (skillId: string, level: FreelancerSkill["proficiencyLevel"]) => {
      onSkillsChange(
        selectedSkills.map((s) =>
          s.skillId === skillId ? { ...s, proficiencyLevel: level } : s
        )
      );
    },
    [selectedSkills, onSkillsChange]
  );

  return (
    <div className="space-y-6">
      {/* Selected skills */}
      {selectedSkills.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
              Selected · {selectedSkills.length} / {maxSkills}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <div
                key={skill.skillId}
                className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-sm border border-rule-strong bg-surface-elevated"
              >
                <span className="text-foreground text-[13px]">
                  {skill.skillName}
                </span>
                <ProficiencyPicker
                  value={skill.proficiencyLevel}
                  onChange={(v) => updateProficiency(skill.skillId, v)}
                />
                <button
                  type="button"
                  onClick={() => removeSkill(skill.skillId)}
                  className="w-5 h-5 rounded-sm flex items-center justify-center hover:bg-rule transition-colors"
                  aria-label={`Remove ${skill.skillName}`}
                >
                  <X className="w-3 h-3 text-subtle" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab toggle */}
      <div className="flex items-center gap-0 border-b border-rule">
        <button
          type="button"
          onClick={() => {
            setActiveTab("browse");
            setSearchQuery("");
          }}
          className={cn(
            "px-4 py-2.5 text-[14px] border-b-2 -mb-px transition-colors",
            activeTab === "browse"
              ? "border-primary text-foreground"
              : "border-transparent text-muted hover:text-foreground"
          )}
        >
          Browse
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={cn(
            "px-4 py-2.5 text-[14px] border-b-2 -mb-px transition-colors",
            activeTab === "search"
              ? "border-primary text-foreground"
              : "border-transparent text-muted hover:text-foreground"
          )}
        >
          Search
        </button>
      </div>

      {/* Search mode */}
      {activeTab === "search" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills… e.g. React, Figma"
              className="w-full pl-7 pr-8 h-11 bg-transparent border-0 border-b border-rule rounded-none text-[15px] text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-subtle hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchQuery.length >= 2 && (
            <div className="rounded-md border border-rule bg-surface overflow-hidden max-h-72 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted">
                  No skills found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                searchResults.map((skill, i) => {
                  const isSelected = selectedIds.has(skill.slug);
                  return (
                    <button
                      key={skill.slug}
                      type="button"
                      onClick={() => toggleSkill(skill.slug)}
                      disabled={
                        !isSelected && selectedSkills.length >= maxSkills
                      }
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                        i > 0 && "border-t border-rule/60",
                        isSelected ? "bg-primary/5" : "hover:bg-surface-elevated",
                        !isSelected &&
                          selectedSkills.length >= maxSkills &&
                          "opacity-30 cursor-not-allowed"
                      )}
                    >
                      <div>
                        <p
                          className={cn(
                            "text-[14px]",
                            isSelected
                              ? "text-primary font-medium"
                              : "text-foreground"
                          )}
                        >
                          {skill.name}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                          {skill.categoryName}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              Type at least 2 characters
            </p>
          )}
        </div>
      )}

      {/* Browse categories mode */}
      {activeTab === "browse" && (
        <div>
          {SKILL_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const selectedInCategory = category.skills.filter((s) =>
              selectedIds.has(s.slug)
            ).length;

            return (
              <div key={category.id} className="border-b border-rule">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-2 py-3 hover:bg-surface-elevated transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-base text-foreground">
                      {category.name}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle tabular-nums">
                      {category.skills.length}
                    </span>
                    {selectedInCategory > 0 && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary tabular-nums">
                        {selectedInCategory} selected
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 pb-4 flex flex-wrap gap-1.5">
                        {category.skills.map((skill) => {
                          const isSelected = selectedIds.has(skill.slug);
                          return (
                            <button
                              key={skill.slug}
                              type="button"
                              onClick={() => toggleSkill(skill.slug)}
                              disabled={
                                !isSelected &&
                                selectedSkills.length >= maxSkills
                              }
                              className={cn(
                                "inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                                isSelected
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "border-rule text-muted hover:text-foreground hover:border-rule-strong",
                                !isSelected &&
                                  selectedSkills.length >= maxSkills &&
                                  "opacity-25 cursor-not-allowed"
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              {skill.name}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {selectedSkills.length >= maxSkills && (
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-warning">
          Maximum of {maxSkills} skills reached.
        </p>
      )}
    </div>
  );
}
