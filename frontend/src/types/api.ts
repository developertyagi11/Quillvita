import type { z } from "zod";

import type { coverLetterResponseSchema, coverLetterToneSchema } from "@/schemas/cover-letter";
import type {
  changeEntrySchema,
  customizeResponseSchema,
  scoreReportSchema,
  suggestedKeywordSchema,
} from "@/schemas/customize";
import type {
  fileDownloadSchema,
  historyDetailSchema,
  historySummarySchema,
} from "@/schemas/history";

export type SuggestedKeyword = z.infer<typeof suggestedKeywordSchema>;
export type ChangeEntry = z.infer<typeof changeEntrySchema>;
export type ScoreReport = z.infer<typeof scoreReportSchema>;
export type CustomizeResponse = z.infer<typeof customizeResponseSchema>;
export type CoverLetterTone = z.infer<typeof coverLetterToneSchema>;
export type CoverLetter = z.infer<typeof coverLetterResponseSchema>;
export type HistorySummary = z.infer<typeof historySummarySchema>;
export type HistoryDetail = z.infer<typeof historyDetailSchema>;
export type FileDownload = z.infer<typeof fileDownloadSchema>;
