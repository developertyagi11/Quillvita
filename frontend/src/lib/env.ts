const DEFAULT_API_URL = "http://localhost:8000";

/** Inlined at build time by Next.js; must be referenced as a full literal property access. */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(
  /\/+$/,
  "",
);
