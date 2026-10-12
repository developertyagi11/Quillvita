import { LogIn } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";

export function HeaderSignInLink(): React.JSX.Element {
  return (
    <ButtonLink href={ROUTES.signIn} size="sm" variant="tertiary">
      Sign in
    </ButtonLink>
  );
}

interface MobileSignInLinksProps {
  readonly onNavigate: () => void;
}

export function MobileSignInLinks({ onNavigate }: MobileSignInLinksProps): React.JSX.Element {
  return (
    <>
      <ButtonLink href={ROUTES.signIn} icon={LogIn} onClick={onNavigate} className="h-11 w-full">
        Sign in
      </ButtonLink>
      <ButtonLink
        href={ROUTES.signUp}
        variant="tertiary"
        onClick={onNavigate}
        className="h-11 w-full"
      >
        Create a free account
      </ButtonLink>
    </>
  );
}
