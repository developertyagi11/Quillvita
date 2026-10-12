import { ROUTES } from "@/lib/routes";

/** Where users land after signing in when no `?next=` is given. */
export const DEFAULT_NEXT_PATH = ROUTES.tailor;

/** Only same-origin paths are allowed, so `?next=` cannot send users to another site. */
export function safeNextPath(value: string | readonly string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string" || !candidate.startsWith("/")) return DEFAULT_NEXT_PATH;
  if (candidate.startsWith("//") || candidate.startsWith("/\\")) return DEFAULT_NEXT_PATH;
  return candidate;
}
