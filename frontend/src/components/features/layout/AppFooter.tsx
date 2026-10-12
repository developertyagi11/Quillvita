import Link from "next/link";

import { BrandLink } from "@/components/features/layout/BrandLink";
import { SECTION_LINKS } from "@/components/features/layout/site-nav";
import type { NavLink } from "@/components/features/layout/site-nav";
import { ROUTES } from "@/lib/routes";

const COLUMNS: readonly { readonly title: string; readonly links: readonly NavLink[] }[] = [
  {
    title: "Product",
    links: [{ href: ROUTES.tailor, label: "Tailor a resume" }, ...SECTION_LINKS],
  },
  {
    title: "Account",
    links: [
      { href: ROUTES.signIn, label: "Sign in" },
      { href: ROUTES.signUp, label: "Create an account" },
      { href: ROUTES.history, label: "Your history" },
    ],
  },
];

export function AppFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-content grid-cols-2 gap-x-md gap-y-xl px-md py-xxl sm:px-lg lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="col-span-2 flex max-w-form flex-col gap-sm lg:col-span-1">
          <BrandLink className="self-start" />
          <p className="text-body-sm text-ink-subtle">
            Tailor your resume to any job posting. Quillvita only rephrases and reorders what is
            already in your resume.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="flex flex-col gap-sm">
            <h2 className="text-eyebrow uppercase text-ink-tertiary">{column.title}</h2>
            <ul className="flex flex-col gap-xs">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-ink-subtle transition-colors duration-fast ease-standard hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-hairline">
        <p className="mx-auto max-w-content px-md py-md text-caption text-ink-tertiary sm:px-lg">
          Always review the result before sending it to an employer. Scores are AI estimates, not a
          real applicant tracking system.
        </p>
      </div>
    </footer>
  );
}
