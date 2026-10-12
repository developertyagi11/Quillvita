"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useHydrated } from "@/hooks/useHydrated";
import { useToast } from "@/hooks/useToast";
import { authClient } from "@/lib/auth/client";
import { clearAccessToken } from "@/lib/auth/token";
import { ROUTES } from "@/lib/routes";

export type AccountState =
  | { readonly status: "loading" }
  | { readonly status: "signed-out" }
  | { readonly status: "signed-in"; readonly email: string };

export interface Account {
  readonly state: AccountState;
  readonly isSigningOut: boolean;
  readonly signOut: () => Promise<void>;
}

export function useAccount(): Account {
  const router = useRouter();
  const toast = useToast();
  const { data: session, isPending } = authClient.useSession();
  const hydrated = useHydrated();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut(): Promise<void> {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      clearAccessToken();
      router.replace(ROUTES.home);
      router.refresh();
    } catch {
      toast.show({ tone: "danger", title: "Sign-out failed. Please try again." });
    } finally {
      setIsSigningOut(false);
    }
  }

  let state: AccountState;
  if (!hydrated || isPending) state = { status: "loading" };
  else if (session) state = { status: "signed-in", email: session.user.email };
  else state = { status: "signed-out" };

  return { state, isSigningOut, signOut };
}
