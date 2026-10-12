import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type AlertTone = "danger" | "info" | "success";

interface AlertProps {
  readonly tone?: AlertTone;
  readonly title: string;
  readonly children?: ReactNode;
  readonly action?: ReactNode;
  readonly className?: string;
}

const TONE_STYLES: Readonly<
  Record<AlertTone, { readonly icon: typeof Info; readonly classes: string }>
> = {
  danger: { icon: CircleAlert, classes: "border-danger/40 bg-danger/10 [&_svg]:text-danger" },
  info: { icon: Info, classes: "border-hairline-strong bg-surface-2 [&_svg]:text-ink-subtle" },
  success: { icon: CircleCheck, classes: "border-success/40 bg-success/10 [&_svg]:text-success" },
};

export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: AlertProps): React.JSX.Element {
  const { icon: Icon, classes } = TONE_STYLES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-sm rounded-md border px-md py-sm", classes, className)}
    >
      <Icon aria-hidden size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-medium text-ink">{title}</p>
        {children ? <div className="mt-xxs text-body-sm text-ink-muted">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}
