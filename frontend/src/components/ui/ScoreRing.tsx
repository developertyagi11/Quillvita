import { SCORE_FAIR_THRESHOLD, SCORE_STRONG_THRESHOLD } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface ScoreRingProps {
  readonly value: number;
  readonly label: string;
  readonly size?: number;
}

const STROKE_WIDTH = 6;
const MAX_SCORE = 100;

export function scoreTone(value: number): "strong" | "fair" | "weak" {
  if (value >= SCORE_STRONG_THRESHOLD) return "strong";
  if (value >= SCORE_FAIR_THRESHOLD) return "fair";
  return "weak";
}

const TONE_CLASSES = {
  strong: "text-success",
  fair: "text-warning",
  weak: "text-danger",
} as const;

export function ScoreRing({ value, label, size = 88 }: ScoreRingProps): React.JSX.Element {
  const clamped = Math.min(Math.max(value, 0), MAX_SCORE);
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / MAX_SCORE);
  const center = size / 2;

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={MAX_SCORE}
      aria-valuenow={clamped}
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          className="stroke-surface-4"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "stroke-current transition-[stroke-dashoffset] duration-base ease-standard",
            TONE_CLASSES[scoreTone(clamped)],
          )}
        />
      </svg>
      <span className="absolute text-card-title tabular-nums text-ink">{clamped}</span>
    </div>
  );
}
