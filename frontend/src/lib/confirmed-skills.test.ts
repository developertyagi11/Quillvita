import { describe, expect, it } from "vitest";

import { mergeSkills, parseSkillList } from "@/lib/confirmed-skills";

describe("parseSkillList", () => {
  it("splits on commas and new lines and drops blanks", () => {
    expect(parseSkillList(" Jest, Cypress\n\nAWS Lambda ,")).toEqual([
      "Jest",
      "Cypress",
      "AWS Lambda",
    ]);
  });
});

describe("mergeSkills", () => {
  it("keeps the first spelling of each skill", () => {
    expect(mergeSkills(["Jest", "Vue"], ["jest", " Angular "], [""])).toEqual([
      "Jest",
      "Vue",
      "Angular",
    ]);
  });
});
