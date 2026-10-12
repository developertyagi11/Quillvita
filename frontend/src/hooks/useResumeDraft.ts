"use client";

import { useCallback, useMemo, useState } from "react";

import { applyChoice, editResume, finalizeResume } from "@/lib/resume-edit";
import type { ChangeChoice, ChangeTarget } from "@/lib/resume-edit";
import type { ResumeContent } from "@/types/resume";

export interface ResumeDraft {
  /** The resume as being edited, including blank lines the user hasn't filled in yet. */
  readonly draft: ResumeContent;
  /** The resume to show, export and write the cover letter from. */
  readonly resume: ResumeContent;
  readonly isEdited: boolean;
  /** Changes whenever the draft is replaced from outside the editor, so editor fields resync. */
  readonly revision: number;
  readonly edit: (recipe: (draft: ResumeContent) => void) => void;
  readonly choose: (targets: readonly ChangeTarget[], choice: ChangeChoice) => void;
  readonly reset: () => void;
}

export function useResumeDraft(tailored: ResumeContent): ResumeDraft {
  const [draft, setDraft] = useState(tailored);
  const [revision, setRevision] = useState(0);
  const resume = useMemo(() => finalizeResume(draft), [draft]);
  const isEdited = useMemo(
    () => JSON.stringify(resume) !== JSON.stringify(finalizeResume(tailored)),
    [resume, tailored],
  );

  const edit = useCallback((recipe: (draft: ResumeContent) => void) => {
    setDraft((current) => editResume(current, recipe));
  }, []);

  const choose = useCallback((targets: readonly ChangeTarget[], choice: ChangeChoice) => {
    setDraft((current) =>
      targets.reduce((resume, target) => applyChoice(resume, target, choice), current),
    );
    setRevision((value) => value + 1);
  }, []);

  const reset = useCallback(() => {
    setDraft(tailored);
    setRevision((value) => value + 1);
  }, [tailored]);

  return { draft, resume, isEdited, revision, edit, choose, reset };
}
