import { diffWords, findBestMatchIndex } from "@/lib/diff";
import type { DiffSegment } from "@/lib/diff";
import type { ExperienceEntry, ProjectEntry } from "@/types/resume";

export interface BulletListDiff {
  readonly lines: readonly (readonly DiffSegment[])[];
  readonly removed: readonly string[];
  readonly changed: boolean;
}

export interface EntryDiff extends BulletListDiff {
  readonly title: string;
}

function isUnchanged(segments: readonly DiffSegment[]): boolean {
  return segments.every((segment) => segment.kind === "equal");
}

/** Pair each tailored bullet with its closest original bullet, then diff word by word. */
export function diffBulletLists(
  original: readonly string[],
  tailored: readonly string[],
): BulletListDiff {
  const used = new Set<number>();
  const lines = tailored.map((bullet) => {
    const matchIndex = findBestMatchIndex(bullet, original, used);
    const match = original[matchIndex];
    if (match === undefined) {
      return diffWords("", bullet);
    }
    used.add(matchIndex);
    return diffWords(match, bullet);
  });
  const removed = original.filter((_, index) => !used.has(index));
  const matchOrder = [...used];
  const reordered = matchOrder.some(
    (originalIndex, position) => originalIndex < (matchOrder[position - 1] ?? -1),
  );
  const changed = removed.length > 0 || reordered || !lines.every(isUnchanged);
  return { lines, removed, changed };
}

export function diffExperience(
  original: readonly ExperienceEntry[],
  tailored: readonly ExperienceEntry[],
): EntryDiff[] {
  // Roles keep their order (enforced by the prompt), so they pair by position.
  return tailored.map((job, index) => ({
    title: `${job.title} · ${job.company}`,
    ...diffBulletLists(original[index]?.bullets ?? [], job.bullets),
  }));
}

function projectLines(project: ProjectEntry | undefined): string[] {
  if (!project) return [];
  return [project.description, ...project.bullets].filter((line) => line.length > 0);
}

export function diffProjects(
  original: readonly ProjectEntry[],
  tailored: readonly ProjectEntry[],
): EntryDiff[] {
  // Projects may be reordered by relevance, so pair them by name.
  return tailored.map((project) => {
    const source = original.find(
      (candidate) => candidate.name.toLowerCase() === project.name.toLowerCase(),
    );
    return { title: project.name, ...diffBulletLists(projectLines(source), projectLines(project)) };
  });
}
