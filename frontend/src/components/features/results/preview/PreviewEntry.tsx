interface PreviewEntryProps {
  readonly heading: string;
  readonly subheading: string;
  readonly meta: string;
  readonly lines: readonly string[];
}

export function PreviewEntry({
  heading,
  subheading,
  meta,
  lines,
}: PreviewEntryProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-xxs">
      <div className="flex flex-wrap items-baseline justify-between gap-x-md gap-y-xxs">
        <p className="text-body-sm text-ink">
          <span className="font-semibold">{heading}</span>
          {subheading ? <span className="text-ink-muted"> · {subheading}</span> : null}
        </p>
        {meta ? <p className="text-caption text-ink-subtle">{meta}</p> : null}
      </div>
      {lines.length > 0 ? (
        <ul className="mt-xxs flex list-disc flex-col gap-xxs pl-md text-body-sm text-ink-muted marker:text-ink-tertiary">
          {lines.map((line, index) => (
            <li key={`${index}-${line.slice(0, 24)}`}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
