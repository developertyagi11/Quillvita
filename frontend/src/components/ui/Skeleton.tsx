import { cn } from "@/lib/cn";

interface SkeletonProps {
  readonly className?: string;
}

export function Skeleton({ className }: SkeletonProps): React.JSX.Element {
  return <div aria-hidden className={cn("animate-pulse rounded-sm bg-surface-3", className)} />;
}
