import { BYTES_PER_KB, BYTES_PER_MB } from "@/lib/constants";

export function formatBytes(bytes: number): string {
  if (bytes < BYTES_PER_KB) {
    return `${bytes} B`;
  }
  if (bytes < BYTES_PER_MB) {
    return `${(bytes / BYTES_PER_KB).toFixed(0)} KB`;
  }
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
}

export function formatDateRange(start: string, end: string): string {
  if (start && end) {
    return `${start} – ${end}`;
  }
  return start || end;
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : DATE_TIME_FORMAT.format(date);
}

export function joinPresent(parts: readonly string[], separator = " · "): string {
  return parts.filter((part) => part.trim().length > 0).join(separator);
}
