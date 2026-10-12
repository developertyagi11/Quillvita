"use client";

import { useCallback, useEffect, useState } from "react";

import {
  deleteHistoryEntry,
  fetchHistory,
  fetchHistoryEntry,
  fetchHistoryFile,
} from "@/lib/api-client";
import { toErrorMessage } from "@/lib/api-error";
import type { HistoryDetail, HistorySummary } from "@/types/api";
import { LOADING_STATE } from "@/types/async-state";
import type { AsyncState } from "@/types/async-state";

function useAsyncResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
): readonly [AsyncState<T>, React.Dispatch<React.SetStateAction<AsyncState<T>>>] {
  const [state, setState] = useState<AsyncState<T>>(LOADING_STATE);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((data) => setState({ status: "success", data }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: "error", message: toErrorMessage(error) });
        }
      });
    return () => controller.abort();
  }, [load]);

  return [state, setState] as const;
}

export interface HistoryListState {
  readonly state: AsyncState<readonly HistorySummary[]>;
  readonly remove: (id: string) => Promise<void>;
}

export function useHistoryList(): HistoryListState {
  const [state, setState] = useAsyncResource(fetchHistory);

  const remove = useCallback(
    async (id: string) => {
      await deleteHistoryEntry(id);
      setState((current) =>
        current.status === "success"
          ? { status: "success", data: current.data.filter((item) => item.id !== id) }
          : current,
      );
    },
    [setState],
  );

  return { state, remove };
}

export function useHistoryEntry(id: string): AsyncState<HistoryDetail> {
  const load = useCallback((signal: AbortSignal) => fetchHistoryEntry(id, signal), [id]);
  return useAsyncResource(load)[0];
}

/** Fetches a short-lived signed URL; the stored object is served as an attachment. */
export async function downloadOriginalResume(id: string): Promise<void> {
  const { url } = await fetchHistoryFile(id);
  window.location.assign(url);
}
