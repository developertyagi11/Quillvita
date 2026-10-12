import { z } from "zod";

export const SECTION_NAMES = ["summary", "skills", "experience", "projects"] as const;
export const sectionNameSchema = z.enum(SECTION_NAMES);

export const changeSectionSchema = z.enum([...SECTION_NAMES, "education"]);

export const contactInfoSchema = z.object({
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  links: z.array(z.string()),
});

export const experienceEntrySchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  bullets: z.array(z.string()),
});

export const educationEntrySchema = z.object({
  degree: z.string(),
  institution: z.string(),
  location: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  details: z.array(z.string()),
});

export const projectEntrySchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  bullets: z.array(z.string()),
  link: z.string(),
});

export const resumeContentSchema = z.object({
  name: z.string(),
  contact: contactInfoSchema,
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(experienceEntrySchema),
  education: z.array(educationEntrySchema),
  projects: z.array(projectEntrySchema),
});
