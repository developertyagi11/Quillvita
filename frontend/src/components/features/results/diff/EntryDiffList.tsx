import { DiffText } from "@/components/features/results/diff/DiffText";
import type { EntryDiff } from "@/lib/resume-diff";

interface EntryDiffListProps {
  readonly entries: readonly EntryDiff[];
}

export function EntryDiffList({ entries }: EntryDiffListProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-md">
      {entries.map((entry, entryIndex) => (
        <div key={`${entryIndex}-${entry.title}`} className="flex flex-col gap-xs">
          <p className="text-body-sm font-semibold text-ink">{entry.title}</p>
          <ul className="flex list-disc flex-col gap-xxs pl-md marker:text-ink-tertiary">
            {entry.lines.map((segments, lineIndex) => (
              <li key={lineIndex}>
                <DiffText segments={segments} />
              </li>
            ))}
            {entry.removed.map((line, lineIndex) => (
              <li key={`removed-${lineIndex}`}>
                <DiffText segments={[{ kind: "removed", text: line }]} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
