import { PreviewEntry } from "@/components/features/results/preview/PreviewEntry";
import { PreviewSection } from "@/components/features/results/preview/PreviewSection";
import { Badge } from "@/components/ui/Badge";
import { formatDateRange, joinPresent } from "@/lib/format";
import type { ResumeContent } from "@/types/resume";

interface ResumePreviewProps {
  readonly resume: ResumeContent;
  readonly highlightedSkills: readonly string[];
}

export function ResumePreview({
  resume,
  highlightedSkills,
}: ResumePreviewProps): React.JSX.Element {
  const { contact } = resume;
  const highlighted = new Set(highlightedSkills.map((skill) => skill.toLowerCase()));
  const contactLine = joinPresent([
    contact.email,
    contact.phone,
    contact.location,
    ...contact.links,
  ]);

  return (
    <article aria-label="Tailored resume" className="flex flex-col gap-lg p-lg sm:p-xl">
      <header className="flex flex-col gap-xxs">
        <h2 className="font-display text-card-title text-ink">{resume.name}</h2>
        {contactLine ? (
          <p className="break-words text-body-sm text-ink-subtle">{contactLine}</p>
        ) : null}
      </header>

      {resume.summary ? (
        <PreviewSection title="Summary">
          <p className="text-body-sm text-ink-muted">{resume.summary}</p>
        </PreviewSection>
      ) : null}

      {resume.skills.length > 0 ? (
        <PreviewSection title="Skills">
          <ul className="flex flex-wrap gap-xs" aria-label="Skills">
            {resume.skills.map((skill, index) => (
              <li key={`${index}-${skill}`}>
                <Badge tone={highlighted.has(skill.toLowerCase()) ? "accent" : "neutral"}>
                  {skill}
                </Badge>
              </li>
            ))}
          </ul>
        </PreviewSection>
      ) : null}

      {resume.experience.length > 0 ? (
        <PreviewSection title="Experience">
          {resume.experience.map((job, index) => (
            <PreviewEntry
              key={`${index}-${job.company}-${job.title}`}
              heading={job.title}
              subheading={job.company}
              meta={joinPresent([job.location, formatDateRange(job.start_date, job.end_date)])}
              lines={job.bullets}
            />
          ))}
        </PreviewSection>
      ) : null}

      {resume.projects.length > 0 ? (
        <PreviewSection title="Projects">
          {resume.projects.map((project, index) => (
            <PreviewEntry
              key={`${index}-${project.name}`}
              heading={project.name}
              subheading={project.technologies.join(", ")}
              meta={project.link}
              lines={[project.description, ...project.bullets].filter(Boolean)}
            />
          ))}
        </PreviewSection>
      ) : null}

      {resume.education.length > 0 ? (
        <PreviewSection title="Education">
          {resume.education.map((school, index) => (
            <PreviewEntry
              key={`${index}-${school.institution}`}
              heading={school.degree}
              subheading={school.institution}
              meta={joinPresent([
                school.location,
                formatDateRange(school.start_date, school.end_date),
              ])}
              lines={school.details}
            />
          ))}
        </PreviewSection>
      ) : null}
    </article>
  );
}
