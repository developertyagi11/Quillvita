type ClassValue = string | false | null | undefined;

/** Join conditional class names, skipping falsy values. */
export function cn(...classes: readonly ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
