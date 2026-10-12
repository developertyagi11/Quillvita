"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { MobileSignInLinks } from "@/components/features/layout/SignInLinks";
import { SECTION_LINKS } from "@/components/features/layout/site-nav";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSessionHint } from "@/hooks/useSessionHint";
import { ROUTES } from "@/lib/routes";

const MobileAccountSection = dynamic(
  () =>
    import("@/components/features/layout/MobileAccountSection").then(
      (module) => module.MobileAccountSection,
    ),
  { ssr: false, loading: () => <Skeleton className="h-11 w-full" /> },
);

interface MobileMenuProps {
  readonly id: string;
  readonly onNavigate: () => void;
}

const LINK_CLASSES =
  "flex h-11 items-center rounded-md px-sm text-body text-ink-muted transition-colors duration-fast ease-standard hover:bg-surface-2 hover:text-ink";

export function MobileMenu({ id, onNavigate }: MobileMenuProps): React.JSX.Element {
  const hasSession = useSessionHint();
  return (
    <div
      id={id}
      className="max-h-[calc(100dvh-56px)] overflow-y-auto border-t border-hairline bg-canvas lg:hidden"
    >
      <div className="mx-auto flex max-w-content flex-col gap-md px-md py-md sm:px-lg">
        <nav aria-label="Site" className="flex flex-col">
          <Link href={ROUTES.tailor} onClick={onNavigate} className={LINK_CLASSES}>
            Tailor a resume
          </Link>
          {SECTION_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={onNavigate} className={LINK_CLASSES}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-xs border-t border-hairline pt-md">
          {hasSession ? (
            <MobileAccountSection onNavigate={onNavigate} />
          ) : (
            <MobileSignInLinks onNavigate={onNavigate} />
          )}

          <ButtonLink
            href={ROUTES.tailor}
            variant="primary"
            onClick={onNavigate}
            className="mt-xs h-11 w-full"
          >
            Tailor my resume
            <ArrowRight aria-hidden size={16} />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
