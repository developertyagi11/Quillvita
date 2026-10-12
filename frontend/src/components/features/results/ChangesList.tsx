import { ArrowDown } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { ChangeEntry } from "@/types/api";
import type { ChangeSection } from "@/types/resume";

interface ChangesListProps {
  readonly changes: readonly ChangeEntry[];
}

const SECTION_TITLES: Readonly<Record<ChangeSection, string>> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
};

export function ChangesList({ changes }: ChangesListProps): React.JSX.Element {
  if (changes.length === 0) {
    return (
      <p className="p-xl text-center text-body-sm text-ink-subtle">
        No edits were needed. Your resume already aligns well with this role.
      </p>
    );
  }

  return (
    <ol className="flex flex-col divide-y divide-hairline">
      {changes.map((change, index) => (
        <li key={`${index}-${change.section}`} className="flex flex-col gap-sm p-lg">
          <div className="flex flex-wrap items-center gap-xs">
            <Badge>{SECTION_TITLES[change.section]}</Badge>
            <p className="text-body-sm text-ink">{change.reason}</p>
          </div>
          <div className="flex flex-col gap-xs rounded-md border border-hairline bg-canvas p-md">
            <p className="text-body-sm text-ink-tertiary">
              <span className="sr-only">Before: </span>
              <del className="decoration-ink-tertiary/60">{change.before || "(empty)"}</del>
            </p>
            <ArrowDown aria-hidden size={14} className="text-ink-tertiary" />
            <p className="text-body-sm text-ink">
              <span className="sr-only">After: </span>
              <ins className="no-underline">{change.after}</ins>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
