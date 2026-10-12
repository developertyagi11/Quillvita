export const MIN_JD_LENGTH = 100;
export const MAX_JD_LENGTH = 20_000;

export const MAX_CONFIRMED_SKILLS = 20;
export const MAX_CONFIRMED_SKILL_LENGTH = 80;

export const MAX_FILE_SIZE_MB = 5;
export const BYTES_PER_KB = 1024;
export const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * BYTES_PER_MB;

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx"] as const;
export const PDF_MIME_TYPE = "application/pdf";
export const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const ACCEPT_ATTRIBUTE = [...ACCEPTED_EXTENSIONS, PDF_MIME_TYPE, DOCX_MIME_TYPE].join(",");

/** Free-tier hosts can take close to a minute to wake up before the LLM even starts. */
export const CUSTOMIZE_TIMEOUT_MS = 180_000;
export const COVER_LETTER_TIMEOUT_MS = 180_000;
export const EXPORT_TIMEOUT_MS = 60_000;
export const HISTORY_TIMEOUT_MS = 60_000;

export const TOAST_DURATION_MS = 4_000;
export const COPY_FEEDBACK_MS = 2_000;

export const SCORE_STRONG_THRESHOLD = 75;
export const SCORE_FAIR_THRESHOLD = 50;
