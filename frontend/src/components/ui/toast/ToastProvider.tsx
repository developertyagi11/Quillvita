"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { ToastContext } from "@/components/ui/toast/toast-context";
import type { Toast, ToastInput } from "@/components/ui/toast/toast-context";
import { ToastViewport } from "@/components/ui/toast/ToastViewport";
import { TOAST_DURATION_MS } from "@/lib/constants";

interface ToastProviderProps {
  readonly children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): React.JSX.Element {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (input: ToastInput) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current, { ...input, id }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext>
  );
}
