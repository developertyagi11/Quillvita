import { z } from "zod";

export const COVER_LETTER_TONES = ["professional", "enthusiastic", "concise"] as const;
export const coverLetterToneSchema = z.enum(COVER_LETTER_TONES);

export const coverLetterResponseSchema = z.object({
  greeting: z.string(),
  paragraphs: z.array(z.string()),
  closing: z.string(),
  signature: z.string(),
});
