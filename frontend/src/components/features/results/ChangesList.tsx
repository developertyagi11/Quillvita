import { ArrowDown, Check, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { changeStatus } from "@/lib/resume-edit";
import type { ChangeChoice, ChangeStatus, ChangeTarget } from "@/lib/resume-edit";
import type { ChangeEntry } from "@/types/api";
import type { ChangeSection, ResumeContent } from "@/types/resume";

interface ChangesListProps {
  readonly changes: readonly ChangeEntry[];
  readonly targets: readonly ChangeTarget[];
  readonly resume: ResumeContent;
  readonly onChoose: (targets: readonly ChangeTarget[], choice: ChangeChoice) => void;
}

const SECTION_TITLES: Readonly<Record<ChangeSection, string>> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
};

const STATUS_NOTES: Readonly<Record<Exclude<ChangeStatus, "kept">, string>> = {
  undone: "Undone. Your original wording is back.",
  edited: "You've edited this text yourself.",
  unavailable: "This change can't be undone here. Edit it in the Tailored resume tab instead.",
};

export function ChangesList({
  changes,
  targets,
  resume,
  onChoose,
}: ChangesListProps): React.JSX.Element {
  if (changes.length === 0) {
    return (
      <p className="p-xl text-center text-body-sm text-ink-subtle">
        No edits were needed. Your resume already aligns well with this role.
      </p>
    );
  }

  const statuses = targets.map((target) => changeStatus(resume, target));
  const keptCount = statuses.filter((status) => status === "kept").length;
  const undoable = targets.filter((_, index) => statuses[index] === "kept");
  const restorable = targets.filter((_, index) => statuses[index] === "undone");

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-sm border-b border-hairline px-lg py-sm">
        <p className="text-body-sm text-ink-subtle" aria-live="polite">
          {keptCount} of {changes.length} changes kept
        </p>
        <div className="flex gap-xs">
          <Button
            size="sm"
            variant="tertiary"
            icon={Check}
            disabled={restorable.length === 0}
            onClick={() => onChoose(restorable, "keep")}
          >
            Keep all
          </Button>
          <Button
            size="sm"
            variant="tertiary"
            icon={RotateCcw}
            disabled={undoable.length === 0}
            onClick={() => onChoose(undoable, "undo")}
          >
            Undo all
          </Button>
        </div>
      </div>
      <ol className="flex flex-col divide-y divide-hairline">
        {changes.map((change, index) => {
          const target = targets[index] ?? { kind: "none" as const };
          const status = statuses[index] ?? "unavailable";
          const isUndone = status === "undone";
          return (
            <li key={`${index}-${change.section}`} className="flex flex-col gap-sm p-lg">
              <div className="flex flex-wrap items-center gap-xs">
                <Badge>{SECTION_TITLES[change.section]}</Badge>
                <p className="text-body-sm text-ink">{change.reason}</p>
              </div>
              <div
                className={cn(
                  "flex flex-col gap-xs rounded-md border border-hairline bg-canvas p-md",
                  isUndone && "opacity-60",
                )}
              >
                <p className="text-body-sm text-ink-tertiary">
                  <span className="sr-only">Before: </span>
                  <del className="decoration-ink-tertiary/60">{change.before || "(empty)"}</del>
                </p>
                <ArrowDown aria-hidden size={14} className="text-ink-tertiary" />
                <p className="text-body-sm text-ink">
                  <span className="sr-only">After: </span>
                  <ins className={cn("no-underline", isUndone && "line-through")}>
                    {change.after || "(removed)"}
                  </ins>
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <p className="text-caption text-ink-subtle">
                  {status === "kept" ? "Kept in your resume." : STATUS_NOTES[status]}
                </p>
                {status === "kept" ? (
                  <Button size="sm" icon={RotateCcw} onClick={() => onChoose([target], "undo")}>
                    Undo
                  </Button>
                ) : null}
                {isUndone ? (
                  <Button size="sm" icon={Check} onClick={() => onChoose([target], "keep")}>
                    Keep change
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
