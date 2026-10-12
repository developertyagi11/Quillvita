import { ROUTES } from "@/lib/routes";

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

/** Sections of the landing page, linked from the header and footer on every page. */
export const SECTION_LINKS: readonly NavLink[] = [
  { href: `${ROUTES.home}#how-it-works`, label: "How it works" },
  { href: `${ROUTES.home}#features`, label: "Features" },
  { href: `${ROUTES.home}#honest`, label: "Why it's honest" },
  { href: `${ROUTES.home}#faq`, label: "FAQ" },
];
