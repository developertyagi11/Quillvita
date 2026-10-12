import { MAX_CONFIRMED_SKILL_LENGTH } from "@/lib/constants";

/** Splits a comma- or newline-separated list the user typed into individual skills. */
export function parseSkillList(text: string): string[] {
  return text
    .split(/[,\n]/)
    .map((skill) => skill.trim().slice(0, MAX_CONFIRMED_SKILL_LENGTH))
    .filter((skill) => skill.length > 0);
}

/** Combines skill lists, keeping the first spelling of each skill (case-insensitive). */
export function mergeSkills(...lists: readonly (readonly string[])[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const skill of lists.flat()) {
    const key = skill.trim().toLowerCase();
    if (key.length === 0 || seen.has(key)) continue;
    seen.add(key);
    merged.push(skill.trim());
  }
  return merged;
}
