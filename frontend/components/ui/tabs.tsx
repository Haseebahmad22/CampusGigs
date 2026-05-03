"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs subcomponent must be used inside <Tabs>");
  return ctx;
}

interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function TabsList({ children, className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 border-b border-rule overflow-x-auto overflow-y-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  count?: number;
}

export function TabsTrigger({
  value: triggerValue,
  count,
  children,
  className,
  ...props
}: TabsTriggerProps) {
  const { value, setValue } = useTabs();
  const active = value === triggerValue;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => setValue(triggerValue)}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-3 -mb-px border-b-2 transition-colors duration-150 text-[14px]",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined ? (
        <span
          className={cn(
            "font-mono text-[10px] tabular-nums uppercase",
            active ? "text-primary" : "text-subtle"
          )}
        >
          {String(count).padStart(2, "0")}
        </span>
      ) : null}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export function TabsContent({
  value: contentValue,
  children,
  className,
  ...props
}: TabsContentProps) {
  const { value } = useTabs();
  if (value !== contentValue) return null;
  return (
    <div role="tabpanel" className={cn("py-6", className)} {...props}>
      {children}
    </div>
  );
}
