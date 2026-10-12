"use client";

import { useEffect, useState } from "react";

const TICK_MS = 1_000;

export interface ProgressSteps {
  readonly activeIndex: number;
  readonly elapsedSeconds: number;
}

/** Advance through `stepCount` steps on a fixed cadence, holding on the last one. */
export function useProgressSteps(stepCount: number, secondsPerStep: number): ProgressSteps {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const activeIndex = Math.min(Math.floor(elapsedSeconds / secondsPerStep), stepCount - 1);
  return { activeIndex, elapsedSeconds };
}
