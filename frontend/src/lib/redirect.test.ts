import { describe, expect, it } from "vitest";

import { DEFAULT_NEXT_PATH, safeNextPath } from "@/lib/redirect";

describe("safeNextPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeNextPath("/history")).toBe("/history");
    expect(safeNextPath(["/history/abc", "/other"])).toBe("/history/abc");
  });

  it("falls back to the tailoring page for missing or external targets", () => {
    expect(DEFAULT_NEXT_PATH).toBe("/tailor");
    expect(safeNextPath(undefined)).toBe("/tailor");
    expect(safeNextPath("https://evil.example.com")).toBe("/tailor");
    expect(safeNextPath("//evil.example.com")).toBe("/tailor");
    expect(safeNextPath("/\\evil.example.com")).toBe("/tailor");
  });
});
