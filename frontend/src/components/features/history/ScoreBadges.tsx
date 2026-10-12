import { Badge } from "@/components/ui/Badge";

interface ScoreBadgesProps {
  readonly matchScore: number;
  readonly atsScore: number;
}

export function ScoreBadges({ matchScore, atsScore }: ScoreBadgesProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-xxs">
      <Badge tone="accent">Match {matchScore}</Badge>
      <Badge>ATS {atsScore}</Badge>
    </div>
  );
}
