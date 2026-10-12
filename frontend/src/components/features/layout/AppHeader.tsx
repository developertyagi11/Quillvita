"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLink } from "@/components/features/layout/BrandLink";
import { MobileMenu } from "@/components/features/layout/MobileMenu";
import { SECTION_LINKS } from "@/components/features/layout/site-nav";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

const MENU_ID = "mobile-menu";
const ACCOUNT_SKELETON = <Skeleton className="h-8 w-40" />;

// The auth client is the largest dependency on the page, so phones only load it when the menu opens.
const AccountMenu = dynamic(
  () => import("@/components/features/layout/AccountMenu").then((module) => module.AccountMenu),
  { ssr: false, loading: () => ACCOUNT_SKELETON },
);

interface AppHeaderProps {
  /** Hidden on the tailor page itself, where the CTA would point at the current page. */
  readonly showPrimaryCta: boolean;
}

// No `usePathname()` here: it would block every dynamic route under `cacheComponents`.
export function AppHeader({ showPrimaryCta }: AppHeaderProps): React.JSX.Element {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setIsMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const closeMenu = (): void => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only rounded-md bg-surface-3 px-sm py-xs text-body-sm text-ink focus:not-sr-only focus:absolute focus:left-md focus:top-xs"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-nav max-w-content items-center gap-md px-md sm:px-lg">
        <BrandLink onClick={closeMenu} />

        <nav aria-label="Site" className="ml-md hidden items-center gap-xxs lg:flex">
          {SECTION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-sm py-xs text-body-sm text-ink-subtle transition-colors duration-fast ease-standard hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-xs">
          <div className="hidden lg:flex">{isDesktop ? <AccountMenu /> : ACCOUNT_SKELETON}</div>
          {showPrimaryCta ? (
            <ButtonLink href={ROUTES.tailor} size="sm" variant="primary" onClick={closeMenu}>
              <span className="sm:hidden">Get started</span>
              <span className="hidden sm:inline">Tailor my resume</span>
              <ArrowRight aria-hidden size={14} className="hidden sm:block" />
            </ButtonLink>
          ) : null}
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls={MENU_ID}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "flex size-9 items-center justify-center rounded-md border border-hairline text-ink-muted lg:hidden",
              "transition-colors duration-fast ease-standard hover:bg-surface-2 hover:text-ink",
            )}
          >
            {isMenuOpen ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
          </button>
        </div>
      </div>
      {isMenuOpen ? <MobileMenu id={MENU_ID} onNavigate={closeMenu} /> : null}
    </header>
  );
}
