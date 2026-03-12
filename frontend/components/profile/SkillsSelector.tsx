"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORIES, searchSkills, ALL_SKILLS } from "@/lib/data/skills";
import type { FreelancerSkill } from "@/lib/types";

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
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
        const skill = ALL_SKILLS.find((s) => s.id === skillId);
        if (!skill) return;
        onSkillsChange([
          ...selectedSkills,
          {
            id: `fs-${Date.now()}-${skillId}`,
            skillId: skill.id,
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
    <div className="space-y-5">
      {/* Selected skills */}
      {selectedSkills.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground">
              Selected ({selectedSkills.length}/{maxSkills})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <div
                key={skill.skillId}
                className="flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full border border-border bg-surface-elevated text-sm"
              >
                <span className="text-foreground font-medium text-xs">{skill.skillName}</span>
                <select
                  value={skill.proficiencyLevel}
                  onChange={(e) =>
                    updateProficiency(
                      skill.skillId,
                      e.target.value as FreelancerSkill["proficiencyLevel"]
                    )
                  }
                  className="bg-transparent text-[10px] text-muted border-none outline-none cursor-pointer appearance-none font-medium uppercase tracking-wider ml-1"
                  title="Proficiency level"
                >
                  <option value="beginner">BGN</option>
                  <option value="intermediate">INT</option>
                  <option value="expert">EXP</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.skillId)}
                  className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-border transition-colors"
                >
                  <X className="w-3 h-3 text-muted" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab toggle */}
      <div className="flex items-center gap-0 border-b border-border">
        <button
          type="button"
          onClick={() => { setActiveTab("browse"); setSearchQuery(""); }}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
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
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills... e.g. React, Figma"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-muted" />
              </button>
            )}
          </div>

          {searchQuery.length >= 2 && (
            <div className="rounded-lg border border-border bg-surface overflow-hidden max-h-72 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted">
                  No skills found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                searchResults.map((skill, i) => {
                  const isSelected = selectedIds.has(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      disabled={!isSelected && selectedSkills.length >= maxSkills}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors",
                        i > 0 && "border-t border-border/40",
                        isSelected ? "bg-primary/5" : "hover:bg-surface-elevated",
                        !isSelected && selectedSkills.length >= maxSkills && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      <div>
                        <p className={cn("text-sm", isSelected ? "text-primary font-medium" : "text-foreground")}>
                          {skill.name}
                        </p>
                        <p className="text-[11px] text-muted">{skill.categoryName}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="text-xs text-muted">Type at least 2 characters</p>
          )}
        </div>
      )}

      {/* Browse categories mode */}
      {activeTab === "browse" && (
        <div className="space-y-1">
          {SKILL_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const selectedInCategory = category.skills.filter((s) =>
              selectedIds.has(s.id)
            ).length;

            return (
              <div key={category.id} className="border-b border-border/50">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-3 py-3 hover:bg-surface-elevated/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-medium text-foreground">
                      {category.name}
                    </span>
                    <span className="text-xs text-muted">
                      {category.skills.length}
                    </span>
                    {selectedInCategory > 0 && (
                      <span className="text-xs text-primary font-medium">
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
                      <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                        {category.skills.map((skill) => {
                          const isSelected = selectedIds.has(skill.id);
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => toggleSkill(skill.id)}
                              disabled={!isSelected && selectedSkills.length >= maxSkills}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                isSelected
                                  ? "bg-primary/10 border-primary/25 text-primary"
                                  : "bg-surface-elevated border-border text-muted hover:text-foreground hover:border-primary/25",
                                !isSelected && selectedSkills.length >= maxSkills && "opacity-25 cursor-not-allowed"
                              )}
                            >
                              {isSelected && <Check className="w-3 h-3 inline mr-1" />}
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
        <p className="text-xs text-warning flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Maximum of {maxSkills} skills reached.
        </p>
      )}
    </div>
  );
}
