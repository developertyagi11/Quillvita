import { Badge } from "@/components/ui/Badge";
import { compareLists } from "@/lib/diff";

interface SkillsDiffProps {
  readonly original: readonly string[];
  readonly tailored: readonly string[];
}

function SkillColumn({
  title,
  skills,
}: {
  readonly title: string;
  readonly skills: readonly string[];
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-xs">
      <p className="text-caption text-ink-subtle">{title}</p>
      <ol className="flex flex-wrap gap-xs">
        {skills.map((skill, index) => (
          <li key={`${index}-${skill}`}>
            <Badge>{skill}</Badge>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SkillsDiff({ original, tailored }: SkillsDiffProps): React.JSX.Element {
  const { added, removed } = compareLists(original, tailored);
  return (
    <div className="flex flex-col gap-md">
      <div className="grid gap-md md:grid-cols-2">
        <SkillColumn title="Original order" skills={original} />
        <SkillColumn title="Tailored order (most relevant first)" skills={tailored} />
      </div>
      {added.length > 0 || removed.length > 0 ? (
        <p className="text-caption text-ink-subtle">
          {added.length > 0 ? `Renamed or surfaced: ${added.join(", ")}. ` : ""}
          {removed.length > 0 ? `Not listed: ${removed.join(", ")}.` : ""}
        </p>
      ) : null}
    </div>
  );
}
