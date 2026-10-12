"use client";

import { use } from "react";

import { ToastContext } from "@/components/ui/toast/toast-context";
import type { ToastContextValue } from "@/components/ui/toast/toast-context";

export function useToast(): ToastContextValue {
  const context = use(ToastContext);
  if (context === null) {
    throw new Error("useToast must be used inside <ToastProvider>.");
  }
  return context;
}
