import type { z } from "zod";

import type {
  changeSectionSchema,
  contactInfoSchema,
  educationEntrySchema,
  experienceEntrySchema,
  projectEntrySchema,
  resumeContentSchema,
  sectionNameSchema,
} from "@/schemas/resume";

export type SectionName = z.infer<typeof sectionNameSchema>;
export type ChangeSection = z.infer<typeof changeSectionSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;

export type ExportFormat = "pdf" | "docx" | "txt";
