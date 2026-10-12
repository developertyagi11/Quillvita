"use client";

import { createContext } from "react";

export type ToastTone = "success" | "danger" | "info";

export interface ToastInput {
  readonly tone: ToastTone;
  readonly title: string;
  readonly description?: string;
}

export interface Toast extends ToastInput {
  readonly id: number;
}

export interface ToastContextValue {
  readonly show: (toast: ToastInput) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
