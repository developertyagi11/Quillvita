import { apiErrorResponseSchema } from "@/schemas/api-error";

export type ClientErrorCode = "network_error" | "timeout" | "aborted" | "invalid_response";

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number | null;

  public constructor(code: string, message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const STATUS_MESSAGES: Readonly<Record<number, string>> = {
  401: "Your session has expired. Please sign in again.",
  404: "That item no longer exists.",
  413: "The file is too large to upload.",
  415: "This file type isn't supported. Upload a PDF or DOCX resume.",
  429: "The AI service is busy right now. Please wait a minute and try again.",
  502: "The AI service returned an unexpected response. Please try again.",
  503: "The AI service is busy right now. Please try again in a minute.",
  504: "The AI took too long to respond. Please try again.",
};
const GENERIC_MESSAGE = "Something went wrong. Please try again.";

export function clientError(code: ClientErrorCode): ApiError {
  const messages: Record<ClientErrorCode, string> = {
    network_error: "We couldn't reach the server. Check your internet connection and try again.",
    timeout: "The request timed out. The server may be waking up; please try again in a moment.",
    aborted: "The request was cancelled.",
    invalid_response: "The server sent a response we couldn't understand. Please try again.",
  };
  return new ApiError(code, messages[code]);
}

export async function errorFromResponse(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  const parsed = apiErrorResponseSchema.safeParse(body);
  if (parsed.success) {
    return new ApiError(parsed.data.error.code, parsed.data.error.message, response.status);
  }
  const message = STATUS_MESSAGES[response.status] ?? GENERIC_MESSAGE;
  return new ApiError("http_error", message, response.status);
}

export function toErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_MESSAGE;
}
