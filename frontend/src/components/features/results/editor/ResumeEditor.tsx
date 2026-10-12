"use client";

import type { ReactNode } from "react";

import {
  LinesField,
  ListField,
  TextField,
} from "@/components/features/results/editor/EditorFields";
import { joinPresent } from "@/lib/format";
import type {
  ContactInfo,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeContent,
} from "@/types/resume";

interface ResumeEditorProps {
  readonly resume: ResumeContent;
  readonly onEdit: (recipe: (draft: ResumeContent) => void) => void;
}

function EditorSection({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}): React.JSX.Element {
  return (
    <section className="flex flex-col gap-md border-t border-hairline pt-lg first:border-t-0 first:pt-0">
      <h3 className="text-caption font-semibold uppercase tracking-wide text-ink-tertiary">
        {title}
      </h3>
      {children}
    </section>
  );
}

function EntryCard({ children }: { readonly children: ReactNode }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-sm rounded-md border border-hairline bg-surface-1 p-md">
      {children}
    </div>
  );
}

export function ResumeEditor({ resume, onEdit }: ResumeEditorProps): React.JSX.Element {
  const setResume = (patch: Partial<ResumeContent>): void =>
    onEdit((draft) => {
      Object.assign(draft, patch);
    });
  const setContact = (patch: Partial<ContactInfo>): void =>
    onEdit((draft) => {
      Object.assign(draft.contact, patch);
    });
  const setJob = (entry: number, patch: Partial<ExperienceEntry>): void =>
    onEdit((draft) => {
      const job = draft.experience[entry];
      if (job) Object.assign(job, patch);
    });
  const setProject = (entry: number, patch: Partial<ProjectEntry>): void =>
    onEdit((draft) => {
      const project = draft.projects[entry];
      if (project) Object.assign(project, patch);
    });
  const setSchool = (entry: number, patch: Partial<EducationEntry>): void =>
    onEdit((draft) => {
      const school = draft.education[entry];
      if (school) Object.assign(school, patch);
    });

  return (
    <form
      aria-label="Edit tailored resume"
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-lg p-lg sm:p-xl"
    >
      <EditorSection title="Header">
        <div className="grid gap-sm sm:grid-cols-2">
          <TextField label="Name" value={resume.name} onChange={(name) => setResume({ name })} />
          <TextField
            label="Email"
            value={resume.contact.email}
            onChange={(email) => setContact({ email })}
          />
          <TextField
            label="Phone"
            value={resume.contact.phone}
            onChange={(phone) => setContact({ phone })}
          />
          <TextField
            label="Location"
            value={resume.contact.location}
            onChange={(location) => setContact({ location })}
          />
        </div>
        <ListField
          label="Links"
          items={resume.contact.links}
          onChange={(links) => setContact({ links })}
          hint="Separate with commas."
        />
      </EditorSection>

      <EditorSection title="Summary">
        <TextField
          label="Summary"
          multiline
          value={resume.summary}
          onChange={(summary) => setResume({ summary })}
        />
      </EditorSection>

      <EditorSection title="Skills">
        <ListField
          label="Skills"
          items={resume.skills}
          onChange={(skills) => setResume({ skills })}
          hint="Separate with commas. They appear in this order on your resume."
        />
      </EditorSection>

      {resume.experience.length > 0 ? (
        <EditorSection title="Experience">
          {resume.experience.map((job, entry) => (
            <EntryCard key={entry}>
              <div className="grid gap-sm sm:grid-cols-2">
                <TextField
                  label="Title"
                  value={job.title}
                  onChange={(title) => setJob(entry, { title })}
                />
                <TextField
                  label="Company"
                  value={job.company}
                  onChange={(company) => setJob(entry, { company })}
                />
                <TextField
                  label="Start"
                  value={job.start_date}
                  onChange={(start_date) => setJob(entry, { start_date })}
                />
                <TextField
                  label="End"
                  value={job.end_date}
                  onChange={(end_date) => setJob(entry, { end_date })}
                />
              </div>
              <LinesField
                label="Bullet"
                context={joinPresent([job.title, job.company], " at ") || `role ${entry + 1}`}
                lines={job.bullets}
                addLabel="Add bullet"
                onChange={(bullets) => setJob(entry, { bullets })}
              />
            </EntryCard>
          ))}
        </EditorSection>
      ) : null}

      {resume.projects.length > 0 ? (
        <EditorSection title="Projects">
          {resume.projects.map((project, entry) => (
            <EntryCard key={entry}>
              <div className="grid gap-sm sm:grid-cols-2">
                <TextField
                  label="Project name"
                  value={project.name}
                  onChange={(name) => setProject(entry, { name })}
                />
                <TextField
                  label="Link"
                  value={project.link}
                  onChange={(link) => setProject(entry, { link })}
                />
              </div>
              <ListField
                label="Technologies"
                items={project.technologies}
                onChange={(technologies) => setProject(entry, { technologies })}
              />
              <TextField
                label="Description"
                multiline
                value={project.description}
                onChange={(description) => setProject(entry, { description })}
              />
              <LinesField
                label="Bullet"
                context={project.name || `project ${entry + 1}`}
                lines={project.bullets}
                addLabel="Add bullet"
                onChange={(bullets) => setProject(entry, { bullets })}
              />
            </EntryCard>
          ))}
        </EditorSection>
      ) : null}

      {resume.education.length > 0 ? (
        <EditorSection title="Education">
          {resume.education.map((school, entry) => (
            <EntryCard key={entry}>
              <div className="grid gap-sm sm:grid-cols-2">
                <TextField
                  label="Degree"
                  value={school.degree}
                  onChange={(degree) => setSchool(entry, { degree })}
                />
                <TextField
                  label="Institution"
                  value={school.institution}
                  onChange={(institution) => setSchool(entry, { institution })}
                />
                <TextField
                  label="Start"
                  value={school.start_date}
                  onChange={(start_date) => setSchool(entry, { start_date })}
                />
                <TextField
                  label="End"
                  value={school.end_date}
                  onChange={(end_date) => setSchool(entry, { end_date })}
                />
              </div>
              <LinesField
                label="Detail"
                context={school.institution || `school ${entry + 1}`}
                lines={school.details}
                addLabel="Add detail"
                onChange={(details) => setSchool(entry, { details })}
              />
            </EntryCard>
          ))}
        </EditorSection>
      ) : null}
    </form>
  );
}
