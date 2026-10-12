import { describe, expect, it } from "vitest";

import { ApiError, errorFromResponse, toErrorMessage } from "@/lib/api-error";
import { customizeResponseSchema } from "@/schemas/customize";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("errorFromResponse", () => {
  it("uses the backend's structured error message", async () => {
    const error = await errorFromResponse(
      jsonResponse(
        { error: { code: "file_too_large", message: "The resume must be 5 MB or smaller." } },
        413,
      ),
    );
    expect(error).toMatchObject({ code: "file_too_large", status: 413 });
    expect(error.message).toBe("The resume must be 5 MB or smaller.");
  });

  it("falls back to a friendly status message for unstructured bodies", async () => {
    const error = await errorFromResponse(
      new Response("<html>Bad gateway</html>", { status: 429 }),
    );
    expect(error.message).toMatch(/busy/);
  });
});

describe("toErrorMessage", () => {
  it("never leaks raw errors", () => {
    expect(toErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "Something went wrong. Please try again.",
    );
    expect(toErrorMessage(new ApiError("timeout", "Timed out"))).toBe("Timed out");
  });
});

describe("customizeResponseSchema", () => {
  it("rejects scores outside 0-100", () => {
    const result = customizeResponseSchema.safeParse({
      original: {},
      tailored: {},
      matched_skills: [],
      suggested_keywords: [],
      scores: { match_score: 120, match_justification: "", ats_score: 50, ats_tips: [] },
      changes: [],
      sections: ["summary"],
    });
    expect(result.success).toBe(false);
  });
});
