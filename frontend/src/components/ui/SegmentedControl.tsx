"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

interface SegmentedControlProps<T extends string> {
  readonly label: string;
  readonly options: readonly SegmentedOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly disabled?: boolean;
}

/** Pill toggle group (DESIGN.md "pricing-tab") built on native radios for keyboard support. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: SegmentedControlProps<T>): React.JSX.Element {
  const name = useId();
  return (
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      <div className="inline-flex flex-wrap gap-xxs rounded-pill border border-hairline bg-canvas p-xxs">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-9 cursor-pointer items-center rounded-pill px-control text-button",
                "transition-colors duration-fast ease-standard has-[:focus-visible]:shadow-focus",
                "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
                isSelected ? "bg-surface-2 text-ink" : "text-ink-subtle hover:text-ink",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
