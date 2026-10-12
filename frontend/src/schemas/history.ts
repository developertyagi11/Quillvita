import { z } from "zod";

import { coverLetterResponseSchema } from "@/schemas/cover-letter";
import { customizeResponseSchema } from "@/schemas/customize";

export const historySummarySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  job_title: z.string(),
  file_name: z.string(),
  match_score: z.number().int(),
  ats_score: z.number().int(),
});

export const historyListSchema = z.object({
  items: z.array(historySummarySchema),
});

export const historyDetailSchema = historySummarySchema.extend({
  job_description: z.string(),
  result: customizeResponseSchema,
  cover_letter: coverLetterResponseSchema.nullable().optional(),
});

export const fileDownloadSchema = z.object({
  url: z.url(),
  file_name: z.string(),
});
