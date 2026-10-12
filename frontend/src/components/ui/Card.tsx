import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLElement> {
  readonly as?: "section" | "div" | "article" | "aside";
  readonly children: ReactNode;
}

export function Card({
  as: Tag = "section",
  className,
  children,
  ...rest
}: CardProps): React.JSX.Element {
  return (
    <Tag
      className={cn("rounded-lg border border-hairline bg-surface-1 shadow-edge", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  readonly title: string;
  readonly titleId?: string;
  readonly description?: string;
  readonly actions?: ReactNode;
}

export function CardHeader({
  title,
  titleId,
  description,
  actions,
}: CardHeaderProps): React.JSX.Element {
  return (
    <header className="flex flex-wrap items-start justify-between gap-sm border-b border-hairline px-lg py-md">
      <div className="min-w-0">
        <h2 id={titleId} className="text-body font-medium text-ink">
          {title}
        </h2>
        {description ? <p className="mt-xxs text-body-sm text-ink-subtle">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-xs">{actions}</div> : null}
    </header>
  );
}
