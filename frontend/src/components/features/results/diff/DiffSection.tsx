import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";

export type DiffStatus = "changed" | "unchanged" | "locked";

interface DiffSectionProps {
  readonly title: string;
  readonly status: DiffStatus;
  readonly children: ReactNode;
}

const STATUS_LABELS: Readonly<Record<DiffStatus, string>> = {
  changed: "Tailored",
  unchanged: "No changes",
  locked: "Kept as written",
};

export function DiffSection({ title, status, children }: DiffSectionProps): React.JSX.Element {
  return (
    <section className="flex flex-col gap-sm p-lg">
      <div className="flex items-center justify-between gap-sm">
        <h3 className="text-eyebrow uppercase text-ink-subtle">{title}</h3>
        <Badge tone={status === "changed" ? "accent" : "neutral"}>{STATUS_LABELS[status]}</Badge>
      </div>
      {children}
    </section>
  );
}
