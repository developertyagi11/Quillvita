"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import type { FileUpload } from "@/hooks/useFileUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { CustomizeInput } from "@/lib/api-client";
import { validateJobDescription } from "@/lib/validation";
import { SECTION_NAMES } from "@/schemas/resume";
import type { SectionName } from "@/types/resume";

export interface CustomizeForm {
  readonly jobDescription: string;
  readonly setJobDescription: (value: string) => void;
  readonly markJobDescriptionTouched: () => void;
  readonly jobDescriptionError: string | null;
  readonly sections: readonly SectionName[];
  readonly toggleSection: (section: SectionName, enabled: boolean) => void;
  readonly sectionsError: string | null;
  readonly upload: FileUpload;
  readonly fileError: string | null;
  readonly handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function useCustomizeForm(onValidSubmit: (input: CustomizeInput) => void): CustomizeForm {
  const [jobDescription, setJobDescription] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [sections, setSections] = useState<readonly SectionName[]>(SECTION_NAMES);
  const upload = useFileUpload();

  const jdValidation = validateJobDescription(jobDescription);
  const showJdError = (isTouched || hasSubmitted) && !jdValidation.ok;
  const sectionsError = sections.length === 0 ? "Select at least one section to tailor." : null;
  const missingFileError =
    hasSubmitted && upload.file === null ? "Upload your resume to continue." : null;

  function toggleSection(section: SectionName, enabled: boolean): void {
    setSections((current) =>
      SECTION_NAMES.filter((name) => (name === section ? enabled : current.includes(name))),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setHasSubmitted(true);
    if (!jdValidation.ok || upload.file === null || sections.length === 0) {
      return;
    }
    onValidSubmit({ file: upload.file, jobDescription, sections });
  }

  return {
    jobDescription,
    setJobDescription,
    markJobDescriptionTouched: () => setIsTouched(true),
    jobDescriptionError: showJdError && !jdValidation.ok ? jdValidation.message : null,
    sections,
    toggleSection,
    sectionsError,
    upload,
    fileError: upload.error ?? missingFileError,
    handleSubmit,
  };
}
