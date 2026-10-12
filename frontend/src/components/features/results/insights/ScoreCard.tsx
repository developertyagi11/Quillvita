import { Card, CardHeader } from "@/components/ui/Card";
import { ScoreRing } from "@/components/ui/ScoreRing";
import type { ScoreReport } from "@/types/api";

interface ScoreCardProps {
  readonly scores: ScoreReport;
}

export function ScoreCard({ scores }: ScoreCardProps): React.JSX.Element {
  return (
    <Card as="section" aria-labelledby="scores-heading">
      <CardHeader title="Scores" titleId="scores-heading" />
      <div className="flex flex-col gap-md p-lg">
        <div className="grid grid-cols-2 gap-md">
          <figure className="flex flex-col items-center gap-xs text-center">
            <ScoreRing value={scores.match_score} label="Job match score" />
            <figcaption className="text-caption text-ink-subtle">Job match</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-xs text-center">
            <ScoreRing value={scores.ats_score} label="ATS readiness score" />
            <figcaption className="text-caption text-ink-subtle">ATS readiness</figcaption>
          </figure>
        </div>
        <p className="text-body-sm text-ink-muted">{scores.match_justification}</p>
        {scores.ats_tips.length > 0 ? (
          <div className="flex flex-col gap-xs border-t border-hairline pt-md">
            <h3 className="text-eyebrow uppercase text-ink-subtle">How to raise your ATS score</h3>
            <ul className="flex list-disc flex-col gap-xxs pl-md text-body-sm text-ink-muted marker:text-ink-tertiary">
              {scores.ats_tips.map((tip, index) => (
                <li key={`${index}-${tip.slice(0, 24)}`}>{tip}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
