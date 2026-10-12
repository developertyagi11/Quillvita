"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/hooks/useToast";
import { COPY_FEEDBACK_MS } from "@/lib/constants";

export interface Clipboard {
  readonly copied: boolean;
  readonly copy: (text: string) => Promise<void>;
}

export function useCopyToClipboard(): Clipboard {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  const { show } = useToast();

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        show({
          tone: "danger",
          title: "Couldn't copy",
          description: "Your browser blocked clipboard access. Use a download instead.",
        });
        return;
      }
      setCopied(true);
      show({ tone: "success", title: "Copied to clipboard" });
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    },
    [show],
  );

  return { copied, copy };
}
