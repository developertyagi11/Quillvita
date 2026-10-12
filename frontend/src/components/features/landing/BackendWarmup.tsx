"use client";

import { useBackendWarmup } from "@/hooks/useBackendWarmup";

/** Starts waking a sleeping backend while the visitor reads the landing page. */
export function BackendWarmup(): null {
  useBackendWarmup();
  return null;
}
