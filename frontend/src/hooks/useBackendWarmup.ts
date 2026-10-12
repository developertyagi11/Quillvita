"use client";

import { useEffect } from "react";

import { warmUpBackend } from "@/lib/warmup";

/** Ping the API once on mount so a sleeping free-tier instance starts booting early. */
export function useBackendWarmup(): void {
  useEffect(() => {
    warmUpBackend();
  }, []);
}
