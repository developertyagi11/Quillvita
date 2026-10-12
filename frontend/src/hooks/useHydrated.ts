"use client";

import { useSyncExternalStore } from "react";

const subscribe = (): (() => void) => () => undefined;

/** False during server rendering and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
