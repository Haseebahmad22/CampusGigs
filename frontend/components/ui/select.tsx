"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
  boxed?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
  triggerClassName,
  size = "md",
  ariaLabel,
  boxed = true,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState<number>(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);
  const heightClass = size === "sm" ? "h-9 text-xs" : "h-11 text-[15px]";

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  React.useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setHighlight(idx >= 0 ? idx : 0);
    }
  }, [open, options, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[highlight];
      if (opt && !opt.disabled) {
        onValueChange(opt.value);
        setOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between transition-colors duration-150",
          "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          boxed
            ? "rounded-md border border-rule-strong bg-surface px-3.5 focus:border-primary"
            : "border-0 border-b border-rule rounded-none px-0 bg-transparent focus:border-primary",
          heightClass,
          open && "border-primary",
          triggerClassName
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            selected ? "text-foreground" : "text-subtle"
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 size-4 shrink-0 text-subtle transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-md border border-rule-strong bg-surface p-1 shadow-[0_2px_0_0_rgba(196,187,161,0.5)]"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-xs text-subtle">No options</li>
          ) : (
            options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isHighlighted = i === highlight;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onMouseEnter={() => !opt.disabled && setHighlight(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (opt.disabled) return;
                    onValueChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-sm transition-colors",
                    opt.disabled
                      ? "cursor-not-allowed text-subtle opacity-60"
                      : isHighlighted
                        ? "bg-surface-elevated text-foreground"
                        : "text-foreground hover:bg-surface-elevated",
                    isSelected && "font-medium"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected ? (
                    <Check className="ml-2 size-4 shrink-0 text-primary" />
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
