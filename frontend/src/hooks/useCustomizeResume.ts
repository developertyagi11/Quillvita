"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { customizeResume } from "@/lib/api-client";
import type { CustomizeInput } from "@/lib/api-client";
import { toErrorMessage } from "@/lib/api-error";
import type { CustomizeResponse } from "@/types/api";
import { IDLE_STATE, LOADING_STATE } from "@/types/async-state";
import type { AsyncState } from "@/types/async-state";

export interface CustomizeSubmission {
  readonly state: AsyncState<CustomizeResponse>;
  readonly lastInput: CustomizeInput | null;
  readonly submit: (input: CustomizeInput) => Promise<void>;
  /** Abort any in-flight request and return to the idle state. */
  readonly reset: () => void;
}

export function useCustomizeResume(): CustomizeSubmission {
  const [state, setState] = useState<AsyncState<CustomizeResponse>>(IDLE_STATE);
  const [lastInput, setLastInput] = useState<CustomizeInput | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const submit = useCallback(async (input: CustomizeInput) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLastInput(input);
    setState(LOADING_STATE);
    try {
      const data = await customizeResume(input, controller.signal);
      setState({ status: "success", data });
    } catch (error) {
      if (controller.signal.aborted) return;
      setState({ status: "error", message: toErrorMessage(error) });
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState(IDLE_STATE);
  }, []);

  return { state, lastInput, submit, reset };
}
