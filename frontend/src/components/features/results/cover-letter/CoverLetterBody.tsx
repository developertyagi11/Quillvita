import type { CoverLetter } from "@/types/api";

interface CoverLetterBodyProps {
  readonly letter: CoverLetter;
}

export function CoverLetterBody({ letter }: CoverLetterBodyProps): React.JSX.Element {
  return (
    <article
      aria-label="Cover letter"
      className="flex max-w-prose flex-col gap-md rounded-md border border-hairline bg-canvas p-lg text-body-sm text-ink-muted"
    >
      <p className="text-ink">{letter.greeting}</p>
      {letter.paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
      ))}
      <p className="text-ink">
        {letter.closing}
        <br />
        {letter.signature}
      </p>
    </article>
  );
}
