import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "success" | "warning" | "accent";

interface BadgeProps {
  readonly tone?: BadgeTone;
  readonly children: ReactNode;
  readonly className?: string;
}

const TONE_CLASSES: Readonly<Record<BadgeTone, string>> = {
  neutral: "border-hairline bg-surface-2 text-ink-muted",
  success: "border-success/30 bg-success/10 text-ink",
  warning: "border-warning/30 bg-warning/10 text-ink",
  accent: "border-primary/40 bg-surface-2 text-ink",
};

export function Badge({ tone = "neutral", children, className }: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-xxs rounded-sm border px-xs py-0.5 text-caption",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
