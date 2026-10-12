import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  readonly label: string;
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
}

export function Checkbox({
  label,
  checked,
  onCheckedChange,
  className,
  ...rest
}: CheckboxProps): React.JSX.Element {
  return (
    <label
      className={cn(
        "group inline-flex min-h-10 cursor-pointer select-none items-center gap-xs rounded-md border px-sm",
        "text-body-sm transition-colors duration-fast ease-standard",
        "has-[:focus-visible]:shadow-focus",
        checked
          ? "border-hairline-strong bg-surface-2 text-ink"
          : "border-hairline bg-transparent text-ink-subtle hover:text-ink",
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        {...rest}
      />
      <span
        aria-hidden
        className={cn(
          "flex size-4 items-center justify-center rounded-xs border transition-colors duration-fast",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-hairline-tertiary",
        )}
      >
        {checked ? <Check size={12} strokeWidth={3} /> : null}
      </span>
      {label}
    </label>
  );
}
