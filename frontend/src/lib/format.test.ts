import { describe, expect, it } from "vitest";

import { filenameFromDisposition } from "@/lib/download";
import { formatBytes, formatDateRange } from "@/lib/format";
import { coverLetterFilename } from "@/lib/resume-text";

describe("formatBytes", () => {
  it("uses the most readable unit", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(3.5 * 1024 * 1024)).toBe("3.5 MB");
  });
});

describe("formatDateRange", () => {
  it("joins both ends or falls back to whichever exists", () => {
    expect(formatDateRange("2021", "Present")).toBe("2021 – Present");
    expect(formatDateRange("", "2020")).toBe("2020");
  });
});

describe("filenameFromDisposition", () => {
  it("extracts the server-provided filename", () => {
    expect(
      filenameFromDisposition('attachment; filename="Jane_Doe_Resume_Tailored.pdf"', "x.pdf"),
    ).toBe("Jane_Doe_Resume_Tailored.pdf");
  });

  it("falls back when the header is missing", () => {
    expect(filenameFromDisposition(null, "Resume_Tailored.txt")).toBe("Resume_Tailored.txt");
  });
});

describe("coverLetterFilename", () => {
  it("strips accents and unsafe characters", () => {
    expect(coverLetterFilename("José Núñez")).toBe("Jose_Nunez_Cover_Letter.txt");
    expect(coverLetterFilename("  ")).toBe("Candidate_Cover_Letter.txt");
  });
});
