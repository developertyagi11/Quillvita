import { formatDateRange, joinPresent } from "@/lib/format";
import type { CoverLetter } from "@/types/api";
import type { ResumeContent } from "@/types/resume";

const FIELD_SEPARATOR = " | ";

function section(title: string, body: readonly string[]): string[] {
  return body.length > 0 ? ["", title.toUpperCase(), ...body] : [];
}

function entry(
  heading: string,
  subheading: string,
  meta: string,
  lines: readonly string[],
): string[] {
  const header = [joinPresent([heading, subheading], FIELD_SEPARATOR)];
  return [...header, ...(meta ? [meta] : []), ...lines.map((line) => `- ${line}`), ""];
}

/** Plain-text rendering used for "copy to clipboard"; mirrors the backend TXT export. */
export function resumeToPlainText(resume: ResumeContent): string {
  const { contact } = resume;
  const contactLine = joinPresent(
    [contact.email, contact.phone, contact.location, ...contact.links],
    FIELD_SEPARATOR,
  );

  const experience = resume.experience.flatMap((job) =>
    entry(
      job.title,
      job.company,
      joinPresent([job.location, formatDateRange(job.start_date, job.end_date)], FIELD_SEPARATOR),
      job.bullets,
    ),
  );
  const projects = resume.projects.flatMap((project) =>
    entry(
      project.name,
      project.technologies.join(", "),
      project.link,
      [project.description, ...project.bullets].filter(Boolean),
    ),
  );
  const education = resume.education.flatMap((school) =>
    entry(
      school.degree,
      school.institution,
      joinPresent(
        [school.location, formatDateRange(school.start_date, school.end_date)],
        FIELD_SEPARATOR,
      ),
      school.details,
    ),
  );

  const lines = [
    resume.name,
    ...(contactLine ? [contactLine] : []),
    ...section("Summary", resume.summary ? [resume.summary] : []),
    ...section("Skills", resume.skills.length > 0 ? [resume.skills.join(", ")] : []),
    ...section("Experience", experience),
    ...section("Projects", projects),
    ...section("Education", education),
  ];
  return `${lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()}\n`;
}

export function coverLetterFilename(name: string): string {
  const stem = name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${stem || "Candidate"}_Cover_Letter.txt`;
}

export function coverLetterToPlainText(letter: CoverLetter): string {
  return [letter.greeting, ...letter.paragraphs, `${letter.closing}\n${letter.signature}`].join(
    "\n\n",
  );
}
