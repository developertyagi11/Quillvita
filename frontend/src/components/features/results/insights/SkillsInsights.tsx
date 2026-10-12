import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import type { SuggestedKeyword } from "@/types/api";

interface MatchedSkillsCardProps {
  readonly skills: readonly string[];
}

export function MatchedSkillsCard({ skills }: MatchedSkillsCardProps): React.JSX.Element {
  return (
    <Card as="section" aria-labelledby="matched-heading">
      <CardHeader
        title="Matched skills"
        titleId="matched-heading"
        description="Requirements your resume already proves."
      />
      <div className="p-lg">
        {skills.length > 0 ? (
          <ul className="flex flex-wrap gap-xs">
            {skills.map((skill, index) => (
              <li key={`${index}-${skill}`}>
                <Badge tone="success">{skill}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-ink-subtle">No direct matches found for this role.</p>
        )}
      </div>
    </Card>
  );
}

interface MissingKeywordsCardProps {
  readonly keywords: readonly SuggestedKeyword[];
}

export function MissingKeywordsCard({ keywords }: MissingKeywordsCardProps): React.JSX.Element {
  return (
    <Card as="section" aria-labelledby="missing-heading">
      <CardHeader
        title="Missing keywords"
        titleId="missing-heading"
        description="Only add these if you genuinely have the experience."
      />
      <div className="p-lg">
        {keywords.length > 0 ? (
          <ul className="flex flex-col gap-sm">
            {keywords.map((item, index) => (
              <li key={`${index}-${item.keyword}`} className="flex flex-col gap-xxs">
                <Badge tone="warning" className="self-start">
                  {item.keyword}
                </Badge>
                <p className="text-body-sm text-ink-subtle">{item.reason}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-ink-subtle">
            Your resume covers the key terms in this posting.
          </p>
        )}
      </div>
    </Card>
  );
}
