import { describe, expect, it } from "vitest";

import { MAX_FILE_SIZE_BYTES, MIN_JD_LENGTH } from "@/lib/constants";
import {
  getFileKind,
  validateFileMetadata,
  validateFileSignature,
  validateJobDescription,
} from "@/lib/validation";

const PDF_HEADER = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
const ZIP_HEADER = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14]);

describe("validateJobDescription", () => {
  it("rejects empty or whitespace-only input", () => {
    expect(validateJobDescription("   \n ")).toMatchObject({ ok: false });
  });

  it("reports how many characters are missing, ignoring surrounding whitespace", () => {
    const result = validateJobDescription(`  ${"a".repeat(MIN_JD_LENGTH - 10)}  `);
    expect(result).toEqual({
      ok: false,
      message: "Add at least 10 more characters for a useful match.",
    });
  });

  it("accepts a description at the minimum length", () => {
    expect(validateJobDescription("a".repeat(MIN_JD_LENGTH))).toEqual({ ok: true });
  });
});

describe("file validation", () => {
  it("detects supported extensions case-insensitively", () => {
    expect(getFileKind("CV.PDF")).toBe("pdf");
    expect(getFileKind("resume.final.docx")).toBe("docx");
    expect(getFileKind("resume.doc")).toBeNull();
  });

  it("accepts DOCX files that browsers report with an empty MIME type", () => {
    expect(validateFileMetadata({ name: "cv.docx", size: 2048, type: "" })).toEqual({ ok: true });
  });

  it("rejects oversized, empty and mismatched files", () => {
    const oversized = { name: "cv.pdf", size: MAX_FILE_SIZE_BYTES + 1, type: "application/pdf" };
    expect(validateFileMetadata(oversized)).toMatchObject({ ok: false });
    expect(
      validateFileMetadata({ name: "cv.pdf", size: 0, type: "application/pdf" }),
    ).toMatchObject({
      ok: false,
    });
    expect(validateFileMetadata({ name: "cv.pdf", size: 10, type: "image/png" })).toMatchObject({
      ok: false,
    });
  });

  it("checks magic bytes against the declared kind", () => {
    expect(validateFileSignature("pdf", PDF_HEADER)).toEqual({ ok: true });
    expect(validateFileSignature("docx", ZIP_HEADER)).toEqual({ ok: true });
    expect(validateFileSignature("pdf", ZIP_HEADER)).toMatchObject({ ok: false });
  });
});
