"use client";

import type { KeyboardEvent } from "react";
import { useRef } from "react";

import { cn } from "@/lib/cn";

export interface TabItem<T extends string> {
  readonly id: T;
  readonly label: string;
  /** Shown instead of `label` below the `sm` breakpoint so all tabs fit on a phone. */
  readonly shortLabel?: string;
  readonly count?: number;
}

interface TabListProps<T extends string> {
  readonly items: readonly TabItem<T>[];
  readonly selected: T;
  readonly onSelect: (id: T) => void;
  readonly label: string;
  readonly idPrefix: string;
}

export function tabId(prefix: string, id: string): string {
  return `${prefix}-tab-${id}`;
}

export function panelId(prefix: string, id: string): string {
  return `${prefix}-panel-${id}`;
}

export function TabList<T extends string>({
  items,
  selected,
  onSelect,
  label,
  idPrefix,
}: TabListProps<T>): React.JSX.Element {
  const refs = useRef<Map<T, HTMLButtonElement>>(new Map());

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const currentIndex = items.findIndex((item) => item.id === selected);
    const offsets: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    let nextIndex: number | null = null;
    if (event.key in offsets) {
      nextIndex = (currentIndex + (offsets[event.key] ?? 0) + items.length) % items.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    }
    const next = nextIndex === null ? undefined : items[nextIndex];
    if (!next) return;
    event.preventDefault();
    onSelect(next.id);
    refs.current.get(next.id)?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="flex gap-xxs overflow-x-auto overflow-y-hidden border-b border-hairline px-xs sm:px-md"
    >
      {items.map((item) => {
        const isSelected = item.id === selected;
        return (
          <button
            key={item.id}
            ref={(node) => {
              if (node) refs.current.set(item.id, node);
              else refs.current.delete(item.id);
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, item.id)}
            aria-selected={isSelected}
            aria-controls={panelId(idPrefix, item.id)}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(item.id)}
            className={cn(
              "relative flex h-11 shrink-0 items-center gap-xs whitespace-nowrap border-b-2 px-xs text-button sm:px-sm",
              "transition-colors duration-fast ease-standard",
              isSelected
                ? "border-primary text-ink"
                : "border-transparent text-ink-subtle hover:text-ink",
            )}
          >
            {item.shortLabel === undefined ? (
              item.label
            ) : (
              <>
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </>
            )}
            {item.count === undefined ? null : (
              <span className="rounded-pill bg-surface-3 px-xs text-caption text-ink-subtle">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
