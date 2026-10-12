import {
  ACCEPTED_EXTENSIONS,
  DOCX_MIME_TYPE,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MAX_JD_LENGTH,
  MIN_JD_LENGTH,
  PDF_MIME_TYPE,
} from "@/lib/constants";

export type ValidationResult =
  { readonly ok: true } | { readonly ok: false; readonly message: string };

export type ResumeFileKind = "pdf" | "docx";

interface FileLike {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

const VALID: ValidationResult = { ok: true };
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d] as const; // "%PDF-"
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04] as const; // "PK\x03\x04", DOCX is a zip archive
export const SIGNATURE_BYTES = PDF_SIGNATURE.length;

const ALLOWED_MIME_TYPES: Readonly<Record<ResumeFileKind, readonly string[]>> = {
  pdf: [PDF_MIME_TYPE, "application/x-pdf"],
  docx: [DOCX_MIME_TYPE],
};
const GENERIC_MIME_TYPES: readonly string[] = ["", "application/octet-stream"];

function invalid(message: string): ValidationResult {
  return { ok: false, message };
}

export function validateJobDescription(text: string): ValidationResult {
  const length = text.trim().length;
  if (length === 0) {
    return invalid("Paste the job description you're applying for.");
  }
  if (length < MIN_JD_LENGTH) {
    return invalid(`Add at least ${MIN_JD_LENGTH - length} more characters for a useful match.`);
  }
  if (length > MAX_JD_LENGTH) {
    return invalid(`Keep the job description under ${MAX_JD_LENGTH.toLocaleString()} characters.`);
  }
  return VALID;
}

export function getFileKind(filename: string): ResumeFileKind | null {
  const lower = filename.toLowerCase();
  const extension = ACCEPTED_EXTENSIONS.find((candidate) => lower.endsWith(candidate));
  if (extension === ".pdf") return "pdf";
  if (extension === ".docx") return "docx";
  return null;
}

export function validateFileMetadata(file: FileLike): ValidationResult {
  const kind = getFileKind(file.name);
  if (kind === null) {
    return invalid("Only PDF and DOCX files are supported.");
  }
  if (file.size === 0) {
    return invalid("This file is empty.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return invalid(`The file is larger than ${MAX_FILE_SIZE_MB} MB.`);
  }
  const mime = file.type.toLowerCase();
  if (!GENERIC_MIME_TYPES.includes(mime) && !ALLOWED_MIME_TYPES[kind].includes(mime)) {
    return invalid("This file type isn't supported. Upload a PDF or DOCX resume.");
  }
  return VALID;
}

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

export function validateFileSignature(kind: ResumeFileKind, header: Uint8Array): ValidationResult {
  const signature = kind === "pdf" ? PDF_SIGNATURE : ZIP_SIGNATURE;
  if (startsWith(header, signature)) {
    return VALID;
  }
  return invalid(
    `This doesn't look like a real ${kind.toUpperCase()} file. It may be corrupted or renamed.`,
  );
}

export async function validateResumeFile(file: File): Promise<ValidationResult> {
  const metadata = validateFileMetadata(file);
  const kind = getFileKind(file.name);
  if (!metadata.ok || kind === null) {
    return metadata;
  }
  const header = new Uint8Array(await file.slice(0, SIGNATURE_BYTES).arrayBuffer());
  return validateFileSignature(kind, header);
}
