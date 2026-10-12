import Link from "next/link";

import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

interface BrandLinkProps {
  readonly className?: string;
  readonly onClick?: () => void;
}

export function BrandLink({ className, onClick }: BrandLinkProps): React.JSX.Element {
  return (
    <Link
      href={ROUTES.home}
      {...(onClick ? { onClick } : {})}
      className={cn(
        "flex shrink-0 items-center gap-xs rounded-sm text-body-sm font-semibold text-ink",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-6 items-center justify-center rounded-sm bg-primary text-caption font-bold text-primary-foreground"
      >
        Q
      </span>
      Quillvita
    </Link>
  );
}
