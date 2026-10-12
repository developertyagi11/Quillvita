import { findBestMatchIndex } from "@/lib/diff";
import type { ChangeEntry } from "@/types/api";
import type { ChangeSection, ResumeContent } from "@/types/resume";

/** A single editable string inside a resume. */
export type TextPath =
  | { readonly field: "summary" }
  | { readonly field: "experienceBullet"; readonly entry: number; readonly index: number }
  | { readonly field: "projectDescription"; readonly entry: number }
  | { readonly field: "projectBullet"; readonly entry: number; readonly index: number }
  | { readonly field: "educationDetail"; readonly entry: number; readonly index: number };

/**
 * What a suggested change rewrote, so it can be undone or restored. Text is found by content
 * rather than position, because the editor can add, remove and reorder lines.
 */
export type ChangeTarget =
  | {
      readonly kind: "text";
      readonly section: ChangeSection;
      /** Where the text was in the tailored resume; an undone added line is restored there. */
      readonly home: TextPath;
      readonly suggested: string;
      readonly original: string;
    }
  | {
      readonly kind: "skillOrder";
      readonly before: readonly string[];
      readonly after: readonly string[];
    }
  | {
      readonly kind: "skillSet";
      readonly added: readonly string[];
      readonly removed: readonly string[];
    }
  | { readonly kind: "none" };

export type ChangeStatus = "kept" | "undone" | "edited" | "unavailable";
export type ChangeChoice = "keep" | "undo";

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function pathKey(path: TextPath): string {
  return JSON.stringify(path);
}

/** Splits a "Python, FastAPI, SQL" style list into trimmed, non-empty items. */
export function splitList(text: string): string[] {
  return text
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function editResume(
  resume: ResumeContent,
  recipe: (draft: ResumeContent) => void,
): ResumeContent {
  const draft = structuredClone(resume);
  recipe(draft);
  return draft;
}

function textPaths(resume: ResumeContent, section: ChangeSection): TextPath[] {
  switch (section) {
    case "summary":
      return [{ field: "summary" }];
    case "experience":
      return resume.experience.flatMap((job, entry) =>
        job.bullets.map((_, index) => ({ field: "experienceBullet" as const, entry, index })),
      );
    case "projects":
      return resume.projects.flatMap((project, entry) => [
        { field: "projectDescription" as const, entry },
        ...project.bullets.map((_, index) => ({ field: "projectBullet" as const, entry, index })),
      ]);
    case "education":
      return resume.education.flatMap((school, entry) =>
        school.details.map((_, index) => ({ field: "educationDetail" as const, entry, index })),
      );
    case "skills":
      return [];
  }
}

export function getText(resume: ResumeContent, path: TextPath): string {
  switch (path.field) {
    case "summary":
      return resume.summary;
    case "experienceBullet":
      return resume.experience[path.entry]?.bullets[path.index] ?? "";
    case "projectDescription":
      return resume.projects[path.entry]?.description ?? "";
    case "projectBullet":
      return resume.projects[path.entry]?.bullets[path.index] ?? "";
    case "educationDetail":
      return resume.education[path.entry]?.details[path.index] ?? "";
  }
}

function setText(resume: ResumeContent, path: TextPath, value: string): ResumeContent {
  return editResume(resume, (draft) => {
    switch (path.field) {
      case "summary":
        draft.summary = value;
        return;
      case "experienceBullet": {
        const job = draft.experience[path.entry];
        if (job && path.index < job.bullets.length) job.bullets[path.index] = value;
        return;
      }
      case "projectDescription": {
        const project = draft.projects[path.entry];
        if (project) project.description = value;
        return;
      }
      case "projectBullet": {
        const project = draft.projects[path.entry];
        if (project && path.index < project.bullets.length) project.bullets[path.index] = value;
        return;
      }
      case "educationDetail": {
        const school = draft.education[path.entry];
        if (school && path.index < school.details.length) school.details[path.index] = value;
        return;
      }
    }
  });
}

/** Adds a line to the list `home` belongs to (or sets the field, for single-value fields). */
function appendText(resume: ResumeContent, home: TextPath, value: string): ResumeContent {
  return editResume(resume, (draft) => {
    switch (home.field) {
      case "summary":
        draft.summary = value;
        return;
      case "projectDescription": {
        const project = draft.projects[home.entry];
        if (project) project.description = value;
        return;
      }
      case "experienceBullet":
        draft.experience[home.entry]?.bullets.push(value);
        return;
      case "projectBullet":
        draft.projects[home.entry]?.bullets.push(value);
        return;
      case "educationDetail":
        draft.education[home.entry]?.details.push(value);
        return;
    }
  });
}

function findText(resume: ResumeContent, section: ChangeSection, text: string): TextPath | null {
  const wanted = normalize(text);
  return (
    textPaths(resume, section).find((path) => normalize(getText(resume, path)) === wanted) ?? null
  );
}

function skillKeys(skills: readonly string[]): Set<string> {
  return new Set(skills.map(normalize));
}

function locateSkillChange(change: ChangeEntry): ChangeTarget {
  const before = splitList(change.before);
  const after = splitList(change.after);
  const beforeKeys = skillKeys(before);
  const afterKeys = skillKeys(after);
  const added = after.filter((skill) => !beforeKeys.has(normalize(skill)));
  const removed = before.filter((skill) => !afterKeys.has(normalize(skill)));
  if (added.length > 0 || removed.length > 0) return { kind: "skillSet", added, removed };
  if (before.map(normalize).join("|") !== after.map(normalize).join("|")) {
    return { kind: "skillOrder", before, after };
  }
  return { kind: "none" };
}

/**
 * Finds the field each change rewrote. The model's "after" text usually matches the tailored
 * resume exactly; when it was paraphrased, the most similar unclaimed field in that section wins.
 */
export function locateChanges(
  tailored: ResumeContent,
  changes: readonly ChangeEntry[],
): ChangeTarget[] {
  const claimed = new Set<string>();
  return changes.map((change): ChangeTarget => {
    if (change.section === "skills") return locateSkillChange(change);
    if (change.after.trim().length === 0) return { kind: "none" };
    const candidates = textPaths(tailored, change.section).filter(
      (path) => !claimed.has(pathKey(path)),
    );
    const texts = candidates.map((path) => getText(tailored, path));
    let index = texts.findIndex((text) => normalize(text) === normalize(change.after));
    if (index === -1) index = findBestMatchIndex(change.after, texts);
    const path = candidates[index];
    if (!path) return { kind: "none" };
    claimed.add(pathKey(path));
    return {
      kind: "text",
      section: change.section,
      home: path,
      suggested: getText(tailored, path),
      original: change.before,
    };
  });
}

/** The relative order of `subset`'s items as they appear in `skills`. */
function orderWithin(skills: readonly string[], subset: readonly string[]): string {
  const keys = skillKeys(subset);
  return skills
    .map(normalize)
    .filter((key) => keys.has(key))
    .join("|");
}

export function changeStatus(resume: ResumeContent, target: ChangeTarget): ChangeStatus {
  switch (target.kind) {
    case "none":
      return "unavailable";
    case "text": {
      if (findText(resume, target.section, target.suggested)) return "kept";
      // An added line has no original wording; once its text is gone, it's undone.
      if (!target.original.trim() || findText(resume, target.section, target.original)) {
        return "undone";
      }
      return "edited";
    }
    case "skillOrder": {
      const current = orderWithin(resume.skills, target.after);
      if (current === target.after.map(normalize).join("|")) return "kept";
      if (current === target.before.map(normalize).join("|")) return "undone";
      return "edited";
    }
    case "skillSet": {
      const present = skillKeys(resume.skills);
      const hasAll = (skills: readonly string[]): boolean =>
        skills.every((skill) => present.has(normalize(skill)));
      const hasNone = (skills: readonly string[]): boolean =>
        skills.every((skill) => !present.has(normalize(skill)));
      if (hasAll(target.added) && hasNone(target.removed)) return "kept";
      if (hasNone(target.added) && hasAll(target.removed)) return "undone";
      return "edited";
    }
  }
}

function reorderWithin(
  skills: readonly string[],
  subset: readonly string[],
  order: readonly string[],
): string[] {
  const keys = skillKeys(subset);
  const queue = order.filter((skill) =>
    skills.some((item) => normalize(item) === normalize(skill)),
  );
  return skills.map((skill) => (keys.has(normalize(skill)) ? (queue.shift() ?? skill) : skill));
}

function swapSkills(
  skills: readonly string[],
  add: readonly string[],
  remove: readonly string[],
): string[] {
  const removeKeys = skillKeys(remove);
  const kept = skills.filter((skill) => !removeKeys.has(normalize(skill)));
  const present = skillKeys(kept);
  return [...kept, ...add.filter((skill) => !present.has(normalize(skill)))];
}

export function applyChoice(
  resume: ResumeContent,
  target: ChangeTarget,
  choice: ChangeChoice,
): ResumeContent {
  const keep = choice === "keep";
  if (changeStatus(resume, target) === (keep ? "kept" : "undone")) return resume;
  switch (target.kind) {
    case "none":
      return resume;
    case "text": {
      const from = keep ? target.original : target.suggested;
      const to = keep ? target.suggested : target.original;
      if (keep && !from.trim()) {
        const blank = normalize(getText(resume, target.home)) === "" ? target.home : null;
        return blank ? setText(resume, blank, to) : appendText(resume, target.home, to);
      }
      const path = findText(resume, target.section, from);
      return path ? setText(resume, path, to) : resume;
    }
    case "skillOrder":
      return editResume(resume, (draft) => {
        draft.skills = reorderWithin(
          draft.skills,
          target.after,
          keep ? target.after : target.before,
        );
      });
    case "skillSet":
      return editResume(resume, (draft) => {
        draft.skills = keep
          ? swapSkills(draft.skills, target.added, target.removed)
          : swapSkills(draft.skills, target.removed, target.added);
      });
  }
}

function present(items: readonly string[]): string[] {
  return items.map((item) => item.trim()).filter((item) => item.length > 0);
}

/**
 * The resume as it should be exported: blank lines left by undoing an added bullet, or by the
 * editor, are dropped.
 */
export function finalizeResume(resume: ResumeContent): ResumeContent {
  return {
    ...resume,
    name: resume.name.trim(),
    summary: resume.summary.trim(),
    contact: { ...resume.contact, links: present(resume.contact.links) },
    skills: present(resume.skills),
    experience: resume.experience.map((job) => ({ ...job, bullets: present(job.bullets) })),
    projects: resume.projects.map((project) => ({
      ...project,
      description: project.description.trim(),
      technologies: present(project.technologies),
      bullets: present(project.bullets),
    })),
    education: resume.education.map((school) => ({ ...school, details: present(school.details) })),
  };
}
