"use client";

import { useSyncExternalStore } from "react";

import { readSessionHint, subscribeToSessionHint } from "@/lib/auth/session-hint";

/** See `readSessionHint`; false during server rendering and hydration. */
export function useSessionHint(): boolean {
  return useSyncExternalStore(subscribeToSessionHint, readSessionHint, () => false);
}
