import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: LucideIcon;
  readonly isLoading?: boolean;
  readonly children: ReactNode;
}

const VARIANT_CLASSES: Readonly<Record<ButtonVariant, string>> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-focus shadow-edge",
  secondary:
    "bg-surface-1 text-ink border border-hairline hover:bg-surface-2 hover:border-hairline-strong",
  tertiary: "bg-transparent text-ink-subtle hover:text-ink hover:bg-surface-2",
};

const SIZE_CLASSES: Readonly<Record<ButtonSize, string>> = {
  sm: "h-8 px-sm gap-xxs",
  md: "h-10 px-control gap-xs",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-md text-button whitespace-nowrap",
    "transition-colors duration-fast ease-standard",
    "disabled:cursor-not-allowed disabled:opacity-50",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly icon?: LucideIcon;
  readonly children: ReactNode;
}

export function ButtonLink({
  variant = "secondary",
  size = "md",
  icon: Icon,
  className,
  children,
  ...rest
}: ButtonLinkProps): React.JSX.Element {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {Icon ? <Icon aria-hidden size={16} /> : null}
      {children}
    </Link>
  );
}

export function Button({
  variant = "secondary",
  size = "md",
  icon: Icon,
  isLoading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps): React.JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled === true || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {isLoading ? <Spinner size={16} /> : Icon ? <Icon aria-hidden size={16} /> : null}
      {children}
    </button>
  );
}
