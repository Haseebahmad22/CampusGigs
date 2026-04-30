import * as React from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-12 gap-3 md:gap-4 auto-rows-[minmax(140px,auto)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type Span1to12 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type RowSpan = 1 | 2 | 3 | 4;

interface BentoCellProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: Span1to12;
  mdColSpan?: Span1to12;
  rowSpan?: RowSpan;
  children: React.ReactNode;
}

const MD_COL_SPAN: Record<Span1to12, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

const ROW_SPAN: Record<RowSpan, string> = {
  1: "row-span-1",
  2: "md:row-span-2",
  3: "md:row-span-3",
  4: "md:row-span-4",
};

export function BentoCell({
  colSpan = 12,
  mdColSpan,
  rowSpan = 1,
  className,
  children,
  ...props
}: BentoCellProps) {
  return (
    <div
      className={cn(
        "col-span-12",
        mdColSpan ? MD_COL_SPAN[mdColSpan] : MD_COL_SPAN[colSpan],
        rowSpan > 1 ? ROW_SPAN[rowSpan] : "",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
