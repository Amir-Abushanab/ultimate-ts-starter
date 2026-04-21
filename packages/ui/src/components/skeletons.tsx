import { cn } from "@ultimate-ts-starter/ui/lib/utils";

import { Skeleton } from "./skeleton";

/** Skeleton for a single line of text */
export const SkeletonText = ({
  className,
  width = "w-3/4",
}: {
  className?: string;
  width?: string;
}) => <Skeleton className={cn("h-4 rounded", width, className)} />;

/** Skeleton for a heading */
export const SkeletonHeading = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-7 w-1/2 rounded", className)} />
);

/** Skeleton for a button */
export const SkeletonButton = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-9 w-24 rounded", className)} />
);

/** Skeleton for an avatar / image */
export const SkeletonAvatar = ({ className }: { className?: string }) => (
  <Skeleton className={cn("size-10 rounded-full", className)} />
);

/** Skeleton for a card with title, description, and content */
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "rounded-lg border bg-card p-4 space-y-3 ring-1 ring-foreground/10",
      className
    )}
  >
    <SkeletonHeading />
    <SkeletonText width="w-full" />
    <SkeletonText width="w-5/6" />
    <SkeletonText width="w-2/3" />
  </div>
);

/** Skeleton for a list of items (repeating rows) */
export const SkeletonList = ({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex items-center gap-3">
        <SkeletonAvatar className="size-8" />
        <div className="flex-1 space-y-1.5">
          <SkeletonText width="w-1/3" />
          <SkeletonText width="w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

/** Skeleton for a full page (heading + content area) */
export const SkeletonPage = ({ className }: { className?: string }) => (
  <div className={cn("space-y-6 p-6", className)}>
    <SkeletonHeading />
    <div className="space-y-3">
      <SkeletonText width="w-full" />
      <SkeletonText width="w-5/6" />
      <SkeletonText width="w-4/5" />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);
