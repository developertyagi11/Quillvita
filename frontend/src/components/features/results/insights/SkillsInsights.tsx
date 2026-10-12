"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { mergeSkills, parseSkillList } from "@/lib/confirmed-skills";
import { MAX_CONFIRMED_SKILLS } from "@/lib/constants";
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
  /** When set, the user can tick skills they really have and re-tailor with them. */
  readonly onAddSkills?: (skills: readonly string[]) => void;
}

const OTHER_SKILLS_ID = "other-skills";
const OTHER_SKILLS_HINT_ID = `${OTHER_SKILLS_ID}-hint`;

export function MissingKeywordsCard({
  keywords,
  onAddSkills,
}: MissingKeywordsCardProps): React.JSX.Element {
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [otherSkills, setOtherSkills] = useState("");
  const selected = mergeSkills(
    keywords.map((item) => item.keyword).filter((keyword) => checked.has(keyword)),
    parseSkillList(otherSkills),
  );
  const tooMany = selected.length > MAX_CONFIRMED_SKILLS;

  function toggle(keyword: string, isChecked: boolean): void {
    setChecked((current) => {
      const next = new Set(current);
      if (isChecked) next.add(keyword);
      else next.delete(keyword);
      return next;
    });
  }

  return (
    <Card as="section" aria-labelledby="missing-heading">
      <CardHeader
        title="Missing keywords"
        titleId="missing-heading"
        description={
          onAddSkills
            ? "Tick only the skills you really have, and we'll add them to your resume."
            : "Only add these if you genuinely have the experience."
        }
      />
      <div className="flex flex-col gap-md p-lg">
        {keywords.length > 0 ? (
          <ul className="flex flex-col gap-sm">
            {keywords.map((item, index) => (
              <li key={`${index}-${item.keyword}`} className="flex flex-col gap-xxs">
                {onAddSkills ? (
                  <Checkbox
                    label={item.keyword}
                    checked={checked.has(item.keyword)}
                    onCheckedChange={(isChecked) => toggle(item.keyword, isChecked)}
                    className="self-start"
                  />
                ) : (
                  <Badge tone="warning" className="self-start">
                    {item.keyword}
                  </Badge>
                )}
                <p className="text-body-sm text-ink-subtle">{item.reason}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-ink-subtle">
            Your resume covers the key terms in this posting.
          </p>
        )}

        {onAddSkills ? (
          <div className="flex flex-col gap-xs border-t border-hairline pt-md">
            <label htmlFor={OTHER_SKILLS_ID} className="text-body-sm font-medium text-ink">
              Other skills you have
            </label>
            <input
              id={OTHER_SKILLS_ID}
              type="text"
              value={otherSkills}
              onChange={(event) => setOtherSkills(event.target.value)}
              aria-describedby={OTHER_SKILLS_HINT_ID}
              placeholder="e.g. Jest, AWS Lambda"
              className="h-10 w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink placeholder:text-ink-tertiary transition-colors duration-fast ease-standard focus-visible:border-hairline-strong"
            />
            <p id={OTHER_SKILLS_HINT_ID} className="text-caption text-ink-subtle">
              {tooMany
                ? `Pick at most ${MAX_CONFIRMED_SKILLS} skills.`
                : "Separate with commas. They go into your skills and summary, never into job history."}
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              disabled={selected.length === 0 || tooMany}
              onClick={() => onAddSkills(selected)}
              className="self-start"
            >
              Add to resume and re-tailor
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
