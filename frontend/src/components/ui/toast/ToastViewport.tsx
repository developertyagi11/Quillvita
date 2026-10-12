import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

import type { Toast, ToastTone } from "@/components/ui/toast/toast-context";
import { cn } from "@/lib/cn";

interface ToastViewportProps {
  readonly toasts: readonly Toast[];
  readonly onDismiss: (id: number) => void;
}

const TONE_ICON: Readonly<
  Record<ToastTone, { readonly icon: typeof Info; readonly className: string }>
> = {
  success: { icon: CircleCheck, className: "text-success" },
  danger: { icon: CircleAlert, className: "text-danger" },
  info: { icon: Info, className: "text-ink-subtle" },
};

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps): React.JSX.Element {
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-xs p-md sm:items-end"
    >
      {toasts.map((toast) => {
        const { icon: Icon, className } = TONE_ICON[toast.tone];
        return (
          <div
            key={toast.id}
            role={toast.tone === "danger" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-toast items-start gap-sm rounded-md border",
              "border-hairline-strong bg-surface-3 px-md py-sm shadow-edge",
            )}
          >
            <Icon aria-hidden size={18} className={cn("mt-0.5 shrink-0", className)} />
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-medium text-ink">{toast.title}</p>
              {toast.description ? (
                <p className="mt-xxs text-body-sm text-ink-subtle">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-xs p-xxs text-ink-subtle transition-colors duration-fast hover:text-ink"
            >
              <X aria-hidden size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
