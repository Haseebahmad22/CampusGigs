import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-paper-shimmer rounded-sm", className)}
      {...props}
    />
  );
}

function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface p-6",
        className
      )}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-3/4" />
      <SkeletonText lines={2} className="mt-3" />
      <div className="mt-5 flex items-center gap-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}

function SkeletonRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b border-border bg-surface p-4",
        className
      )}
    >
      <Skeleton className="size-10 rounded-sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonRow };
