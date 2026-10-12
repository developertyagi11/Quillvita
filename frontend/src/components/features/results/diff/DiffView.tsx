import { DiffSection } from "@/components/features/results/diff/DiffSection";
import type { DiffStatus } from "@/components/features/results/diff/DiffSection";
import { DiffText } from "@/components/features/results/diff/DiffText";
import { EntryDiffList } from "@/components/features/results/diff/EntryDiffList";
import { SkillsDiff } from "@/components/features/results/diff/SkillsDiff";
import { diffWords } from "@/lib/diff";
import { diffExperience, diffProjects } from "@/lib/resume-diff";
import type { ResumeContent, SectionName } from "@/types/resume";

interface DiffViewProps {
  readonly original: ResumeContent;
  readonly tailored: ResumeContent;
  readonly sections: readonly SectionName[];
}

function statusOf(
  section: SectionName,
  sections: readonly SectionName[],
  changed: boolean,
): DiffStatus {
  if (!sections.includes(section)) return "locked";
  return changed ? "changed" : "unchanged";
}

export function DiffView({ original, tailored, sections }: DiffViewProps): React.JSX.Element {
  const summary = diffWords(original.summary, tailored.summary);
  const summaryChanged = summary.some((segment) => segment.kind !== "equal");
  const skillsChanged = original.skills.join("|") !== tailored.skills.join("|");
  const experience = diffExperience(original.experience, tailored.experience);
  const projects = diffProjects(original.projects, tailored.projects);

  return (
    <div className="flex flex-col divide-y divide-hairline">
      <p className="flex flex-wrap items-center gap-md px-lg py-sm text-caption text-ink-subtle">
        <span className="flex items-center gap-xxs">
          <span aria-hidden className="size-3 rounded-xs bg-success/30" /> Added wording
        </span>
        <span className="flex items-center gap-xxs">
          <span aria-hidden className="size-3 rounded-xs bg-danger/25" /> Removed wording
        </span>
      </p>
      {original.summary || tailored.summary ? (
        <DiffSection title="Summary" status={statusOf("summary", sections, summaryChanged)}>
          <p>
            <DiffText segments={summary} />
          </p>
        </DiffSection>
      ) : null}
      {tailored.skills.length > 0 ? (
        <DiffSection title="Skills" status={statusOf("skills", sections, skillsChanged)}>
          <SkillsDiff original={original.skills} tailored={tailored.skills} />
        </DiffSection>
      ) : null}
      {experience.length > 0 ? (
        <DiffSection
          title="Experience"
          status={statusOf(
            "experience",
            sections,
            experience.some((entry) => entry.changed),
          )}
        >
          <EntryDiffList entries={experience} />
        </DiffSection>
      ) : null}
      {projects.length > 0 ? (
        <DiffSection
          title="Projects"
          status={statusOf(
            "projects",
            sections,
            projects.some((entry) => entry.changed),
          )}
        >
          <EntryDiffList entries={projects} />
        </DiffSection>
      ) : null}
    </div>
  );
}
