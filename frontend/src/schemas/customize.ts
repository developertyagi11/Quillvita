import { z } from "zod";

import { changeSectionSchema, resumeContentSchema, sectionNameSchema } from "@/schemas/resume";

const scoreSchema = z.number().int().min(0).max(100);

export const suggestedKeywordSchema = z.object({
  keyword: z.string(),
  reason: z.string(),
});

export const changeEntrySchema = z.object({
  section: changeSectionSchema,
  before: z.string(),
  after: z.string(),
  reason: z.string(),
});

export const scoreReportSchema = z.object({
  match_score: scoreSchema,
  match_justification: z.string(),
  ats_score: scoreSchema,
  ats_tips: z.array(z.string()),
});

export const customizeResponseSchema = z.object({
  original: resumeContentSchema,
  tailored: resumeContentSchema,
  matched_skills: z.array(z.string()),
  suggested_keywords: z.array(suggestedKeywordSchema),
  scores: scoreReportSchema,
  changes: z.array(changeEntrySchema),
  sections: z.array(sectionNameSchema),
  /** Set when the run was saved to the signed-in user's history. */
  history_id: z.string().nullable().optional(),
});
