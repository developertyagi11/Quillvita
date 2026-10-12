import { describe, expect, it } from "vitest";

import {
  applyChoice,
  changeStatus,
  editResume,
  finalizeResume,
  locateChanges,
  splitList,
} from "@/lib/resume-edit";
import type { ChangeEntry } from "@/types/api";
import type { ResumeContent } from "@/types/resume";

const TAILORED: ResumeContent = {
  name: "Jane Doe",
  contact: { email: "jane@example.com", phone: "", location: "", links: [] },
  summary: "Backend engineer building FastAPI services.",
  skills: ["FastAPI", "Python", "SQL"],
  experience: [
    {
      title: "Engineer",
      company: "Acme",
      location: "",
      start_date: "2021",
      end_date: "Present",
      bullets: ["Built FastAPI services handling 2M requests a day", "Mentored 3 engineers"],
    },
  ],
  education: [],
  projects: [],
};

function change(section: ChangeEntry["section"], before: string, after: string): ChangeEntry {
  return { section, before, after, reason: "Matches the job" };
}

describe("locateChanges", () => {
  it("finds rewritten text exactly, or by similarity when the model paraphrased it", () => {
    const [summary, bullet] = locateChanges(TAILORED, [
      change("summary", "Backend engineer.", "Backend engineer building FastAPI services."),
      change("experience", "Built APIs handling 2M requests a day", "Built FastAPI services"),
    ]);
    expect(summary).toMatchObject({ kind: "text", home: { field: "summary" } });
    expect(bullet).toMatchObject({
      kind: "text",
      home: { field: "experienceBullet", entry: 0, index: 0 },
      suggested: "Built FastAPI services handling 2M requests a day",
    });
  });

  it("can't locate removed text", () => {
    expect(locateChanges(TAILORED, [change("experience", "Old bullet", "")])).toEqual([
      { kind: "none" },
    ]);
  });
});

describe("undoing and keeping changes", () => {
  it("swaps a rewritten bullet back and forth", () => {
    const [target] = locateChanges(TAILORED, [
      change(
        "experience",
        "Built APIs handling 2M requests a day",
        "Built FastAPI services handling 2M requests a day",
      ),
    ]);
    if (!target) throw new Error("expected a target");
    expect(changeStatus(TAILORED, target)).toBe("kept");

    const undone = applyChoice(TAILORED, target, "undo");
    expect(undone.experience[0]?.bullets[0]).toBe("Built APIs handling 2M requests a day");
    expect(changeStatus(undone, target)).toBe("undone");

    const kept = applyChoice(undone, target, "keep");
    expect(changeStatus(kept, target)).toBe("kept");
  });

  it("still undoes the right line after the user removed a line above it", () => {
    const [target] = locateChanges(TAILORED, [
      change("experience", "Coached 3 engineers", "Mentored 3 engineers"),
    ]);
    if (!target) throw new Error("expected a target");
    const edited = editResume(TAILORED, (draft) => {
      draft.experience[0]?.bullets.shift();
    });
    expect(applyChoice(edited, target, "undo").experience[0]?.bullets).toEqual([
      "Coached 3 engineers",
    ]);
  });

  it("restores an undone added line only once", () => {
    const [target] = locateChanges(TAILORED, [change("experience", "", "Mentored 3 engineers")]);
    if (!target) throw new Error("expected a target");
    const restored = applyChoice(applyChoice(TAILORED, target, "undo"), target, "keep");
    expect(applyChoice(restored, target, "keep").experience[0]?.bullets).toEqual(
      TAILORED.experience[0]?.bullets,
    );
  });

  it("reports text the user edited by hand", () => {
    const [target] = locateChanges(TAILORED, [
      change("summary", "Backend engineer.", "Backend engineer building FastAPI services."),
    ]);
    if (!target) throw new Error("expected a target");
    expect(changeStatus({ ...TAILORED, summary: "Something else" }, target)).toBe("edited");
  });

  it("removes an added skill on undo and restores it on keep", () => {
    const [target] = locateChanges(TAILORED, [
      change("skills", "Python, SQL", "FastAPI, Python, SQL"),
    ]);
    if (!target) throw new Error("expected a target");
    const undone = applyChoice(TAILORED, target, "undo");
    expect(undone.skills).toEqual(["Python", "SQL"]);
    expect(changeStatus(undone, target)).toBe("undone");
    expect(applyChoice(undone, target, "keep").skills).toEqual(["Python", "SQL", "FastAPI"]);
  });

  it("restores the original order of reordered skills", () => {
    const [target] = locateChanges(TAILORED, [
      change("skills", "Python, SQL, FastAPI", "FastAPI, Python, SQL"),
    ]);
    if (!target) throw new Error("expected a target");
    expect(target.kind).toBe("skillOrder");
    const undone = applyChoice(TAILORED, target, "undo");
    expect(undone.skills).toEqual(["Python", "SQL", "FastAPI"]);
    expect(changeStatus(undone, target)).toBe("undone");
  });

  it("blanks an added bullet on undo, and the exported resume drops the blank", () => {
    const [target] = locateChanges(TAILORED, [change("experience", "", "Mentored 3 engineers")]);
    if (!target) throw new Error("expected a target");
    const undone = applyChoice(TAILORED, target, "undo");
    expect(finalizeResume(undone).experience[0]?.bullets).toEqual([
      "Built FastAPI services handling 2M requests a day",
    ]);
  });
});

describe("splitList", () => {
  it("splits on commas and new lines", () => {
    expect(splitList("Python, SQL\n\nGo ,")).toEqual(["Python", "SQL", "Go"]);
  });
});
