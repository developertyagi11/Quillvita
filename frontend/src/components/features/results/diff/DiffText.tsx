import type { DiffSegment } from "@/lib/diff";

interface DiffTextProps {
  readonly segments: readonly DiffSegment[];
}

export function DiffText({ segments }: DiffTextProps): React.JSX.Element {
  return (
    <span className="text-body-sm text-ink-muted">
      {segments.map((segment, index) => {
        const key = `${index}-${segment.kind}`;
        const spacer = index < segments.length - 1 ? " " : "";
        if (segment.kind === "added") {
          return (
            <span key={key}>
              <ins className="rounded-xs bg-success/15 px-0.5 text-ink no-underline">
                <span className="sr-only">added: </span>
                {segment.text}
              </ins>
              {spacer}
            </span>
          );
        }
        if (segment.kind === "removed") {
          return (
            <span key={key}>
              <del className="rounded-xs bg-danger/10 px-0.5 text-ink-subtle decoration-danger/60">
                <span className="sr-only">removed: </span>
                {segment.text}
              </del>
              {spacer}
            </span>
          );
        }
        return <span key={key}>{segment.text + spacer}</span>;
      })}
    </span>
  );
}
