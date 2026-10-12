export function PageIntro(): React.JSX.Element {
  return (
    <div className="flex max-w-prose flex-col gap-sm">
      <p className="text-eyebrow uppercase text-ink-subtle">Resume tailoring</p>
      <h1 className="font-display text-headline text-ink sm:text-display-md">
        Fit your resume to the job, without inventing a thing.
      </h1>
      <p className="text-body text-ink-subtle sm:text-body-lg">
        Paste a job description and upload your resume. You get a rewritten version that mirrors the
        role&apos;s language, a match score, the keywords you&apos;re missing, and every change
        explained.
      </p>
    </div>
  );
}
