import type { z } from "zod";

import { ApiError, clientError, errorFromResponse } from "@/lib/api-error";
import { getAccessToken } from "@/lib/auth/token";
import {
  COVER_LETTER_TIMEOUT_MS,
  CUSTOMIZE_TIMEOUT_MS,
  EXPORT_TIMEOUT_MS,
  HISTORY_TIMEOUT_MS,
} from "@/lib/constants";
import { filenameFromDisposition } from "@/lib/download";
import { API_BASE_URL } from "@/lib/env";
import { coverLetterResponseSchema } from "@/schemas/cover-letter";
import { customizeResponseSchema } from "@/schemas/customize";
import { fileDownloadSchema, historyDetailSchema, historyListSchema } from "@/schemas/history";
import type {
  CoverLetter,
  CoverLetterTone,
  CustomizeResponse,
  FileDownload,
  HistoryDetail,
  HistorySummary,
} from "@/types/api";
import type { ExportFormat, ResumeContent, SectionName } from "@/types/resume";

interface RequestOptions {
  readonly init: RequestInit;
  readonly timeoutMs: number;
  readonly signal?: AbortSignal | undefined;
  /** Attach the signed-in user's Neon Auth token, when there is one. */
  readonly withAuth?: boolean;
}

async function authorizationHeaders(withAuth: boolean): Promise<Record<string, string>> {
  if (!withAuth) return {};
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(
  path: string,
  { init, timeoutMs, signal, withAuth = false }: RequestOptions,
): Promise<Response> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
  const headers = new Headers(init.headers);
  for (const [name, value] of Object.entries(await authorizationHeaders(withAuth))) {
    headers.set(name, value);
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, signal: combined });
  } catch {
    if (timeoutSignal.aborted) throw clientError("timeout");
    if (signal?.aborted) throw clientError("aborted");
    throw clientError("network_error");
  }
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  return response;
}

async function parseJson<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  const body: unknown = await response.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw clientError("invalid_response");
  }
  return parsed.data;
}

function jsonInit(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export interface CustomizeInput {
  readonly file: File;
  readonly jobDescription: string;
  readonly sections: readonly SectionName[];
  /** Skills the user says they have that the resume doesn't mention. */
  readonly confirmedSkills?: readonly string[];
}

export async function customizeResume(
  input: CustomizeInput,
  signal?: AbortSignal,
): Promise<CustomizeResponse> {
  const form = new FormData();
  form.append("resume", input.file, input.file.name);
  form.append("job_description", input.jobDescription.trim());
  input.sections.forEach((section) => form.append("sections", section));
  input.confirmedSkills?.forEach((skill) => form.append("confirmed_skills", skill));

  const response = await request("/api/customize", {
    init: { method: "POST", body: form },
    timeoutMs: CUSTOMIZE_TIMEOUT_MS,
    signal,
    withAuth: true,
  });
  return parseJson(response, customizeResponseSchema);
}

export interface ExportedFile {
  readonly blob: Blob;
  readonly filename: string;
}

export async function exportResume(
  resume: ResumeContent,
  format: ExportFormat,
): Promise<ExportedFile> {
  const response = await request("/api/export", {
    init: jsonInit({ resume, format }),
    timeoutMs: EXPORT_TIMEOUT_MS,
  });
  const blob = await response.blob().catch(() => {
    throw new ApiError("invalid_response", "The downloaded file was incomplete. Please try again.");
  });
  const filename = filenameFromDisposition(
    response.headers.get("Content-Disposition"),
    `Resume_Tailored.${format}`,
  );
  return { blob, filename };
}

export interface CoverLetterInput {
  readonly resume: ResumeContent;
  readonly jobDescription: string;
  readonly tone: CoverLetterTone;
  /** Saved run the letter belongs to; the backend stores it there for the signed-in owner. */
  readonly historyId: string | null;
}

export async function generateCoverLetter(
  input: CoverLetterInput,
  signal?: AbortSignal,
): Promise<CoverLetter> {
  const response = await request("/api/cover-letter", {
    init: jsonInit({
      resume: input.resume,
      job_description: input.jobDescription.trim(),
      tone: input.tone,
      history_id: input.historyId,
    }),
    timeoutMs: COVER_LETTER_TIMEOUT_MS,
    signal,
    withAuth: input.historyId !== null,
  });
  return parseJson(response, coverLetterResponseSchema);
}

export async function fetchHistory(signal?: AbortSignal): Promise<readonly HistorySummary[]> {
  const response = await request("/api/history", {
    init: { method: "GET" },
    timeoutMs: HISTORY_TIMEOUT_MS,
    signal,
    withAuth: true,
  });
  return (await parseJson(response, historyListSchema)).items;
}

export async function fetchHistoryEntry(id: string, signal?: AbortSignal): Promise<HistoryDetail> {
  const response = await request(`/api/history/${encodeURIComponent(id)}`, {
    init: { method: "GET" },
    timeoutMs: HISTORY_TIMEOUT_MS,
    signal,
    withAuth: true,
  });
  return parseJson(response, historyDetailSchema);
}

export async function fetchHistoryFile(id: string): Promise<FileDownload> {
  const response = await request(`/api/history/${encodeURIComponent(id)}/file`, {
    init: { method: "GET" },
    timeoutMs: HISTORY_TIMEOUT_MS,
    withAuth: true,
  });
  return parseJson(response, fileDownloadSchema);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  await request(`/api/history/${encodeURIComponent(id)}`, {
    init: { method: "DELETE" },
    timeoutMs: HISTORY_TIMEOUT_MS,
    withAuth: true,
  });
}
