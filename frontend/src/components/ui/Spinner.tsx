import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

interface SpinnerProps {
  readonly size?: number;
  readonly className?: string;
}

export function Spinner({ size = 16, className }: SpinnerProps): React.JSX.Element {
  return <LoaderCircle aria-hidden size={size} className={cn("animate-spin", className)} />;
}
