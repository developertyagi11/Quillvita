import { describe, expect, it } from "vitest";

import { compareLists, diffWords, findBestMatchIndex } from "@/lib/diff";
import { diffBulletLists } from "@/lib/resume-diff";

describe("diffWords", () => {
  it("marks inserted and removed words while keeping shared ones", () => {
    expect(diffWords("Built APIs in Python", "Built scalable APIs with Python")).toEqual([
      { kind: "equal", text: "Built" },
      { kind: "added", text: "scalable" },
      { kind: "equal", text: "APIs" },
      { kind: "removed", text: "in" },
      { kind: "added", text: "with" },
      { kind: "equal", text: "Python" },
    ]);
  });

  it("ignores case and trailing punctuation when matching words", () => {
    expect(diffWords("Led the team.", "led the team")).toEqual([
      { kind: "equal", text: "led the team" },
    ]);
  });

  it("handles empty inputs", () => {
    expect(diffWords("", "New text")).toEqual([{ kind: "added", text: "New text" }]);
    expect(diffWords("", "")).toEqual([]);
  });
});

describe("findBestMatchIndex", () => {
  const originals = ["Mentored 3 junior engineers", "Built REST APIs with FastAPI"];

  it("pairs a rewritten line with its most similar original", () => {
    expect(findBestMatchIndex("Built REST APIs using FastAPI at scale", originals)).toBe(1);
  });

  it("skips excluded indices and returns -1 when nothing is similar", () => {
    expect(findBestMatchIndex("Built REST APIs", originals, new Set([1]))).toBe(-1);
    expect(findBestMatchIndex("Completely unrelated sentence", originals)).toBe(-1);
  });
});

describe("diffBulletLists", () => {
  it("detects reordering and removed bullets", () => {
    const result = diffBulletLists(
      ["First idea", "Second idea", "Dropped idea entirely"],
      ["Second idea", "First idea"],
    );
    expect(result.changed).toBe(true);
    expect(result.removed).toEqual(["Dropped idea entirely"]);
  });

  it("reports unchanged lists", () => {
    expect(diffBulletLists(["Same line"], ["Same line"]).changed).toBe(false);
  });
});

describe("compareLists", () => {
  it("finds case-insensitive additions and removals", () => {
    expect(compareLists(["Python", "JS"], ["python", "JavaScript"])).toEqual({
      added: ["JavaScript"],
      removed: ["JS"],
    });
  });
});
