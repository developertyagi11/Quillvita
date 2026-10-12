"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { generateCoverLetter } from "@/lib/api-client";
import { toErrorMessage } from "@/lib/api-error";
import type { CoverLetter, CoverLetterTone } from "@/types/api";
import { IDLE_STATE, LOADING_STATE } from "@/types/async-state";
import type { AsyncState } from "@/types/async-state";
import type { ResumeContent } from "@/types/resume";

export interface CoverLetterGenerator {
  readonly state: AsyncState<CoverLetter>;
  readonly tone: CoverLetterTone;
  readonly setTone: (tone: CoverLetterTone) => void;
  readonly generate: () => Promise<void>;
}

export function useCoverLetter(
  resume: ResumeContent,
  jobDescription: string,
): CoverLetterGenerator {
  const [state, setState] = useState<AsyncState<CoverLetter>>(IDLE_STATE);
  const [tone, setTone] = useState<CoverLetterTone>("professional");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const generate = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState(LOADING_STATE);
    try {
      const data = await generateCoverLetter({ resume, jobDescription, tone }, controller.signal);
      setState({ status: "success", data });
    } catch (error) {
      if (controller.signal.aborted) return;
      setState({ status: "error", message: toErrorMessage(error) });
    }
  }, [resume, jobDescription, tone]);

  return { state, tone, setTone, generate };
}
