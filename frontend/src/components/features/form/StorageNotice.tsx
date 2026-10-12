"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ROUTES } from "@/lib/routes";

type SessionStatus = "checking" | "signed-in" | "signed-out";

const SESSION_ENDPOINT = "/api/auth/get-session";

/** Responds 200 with `null` when signed out, so a signed-out check logs no failed request. */
async function hasSession(): Promise<boolean> {
  try {
    const response = await fetch(SESSION_ENDPOINT, {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) return false;
    const body: unknown = await response.json();
    return body !== null && typeof body === "object";
  } catch {
    return false;
  }
}

/** Checks the session with one request instead of the auth SDK, which keeps the SDK off this page. */
export function StorageNotice(): React.JSX.Element {
  const [status, setStatus] = useState<SessionStatus>("checking");

  useEffect(() => {
    let active = true;
    void hasSession().then((signedIn) => {
      if (active) setStatus(signedIn ? "signed-in" : "signed-out");
    });
    return () => {
      active = false;
    };
  }, []);

  let content: React.ReactNode = "\u00a0";
  if (status === "signed-in") {
    content = "You're signed in, so this resume and its results are saved to your history.";
  } else if (status === "signed-out") {
    content = (
      <>
        Your file is processed in memory and not stored.{" "}
        <Link
          href={{ pathname: ROUTES.signIn, query: { next: ROUTES.tailor } }}
          className="text-ink-subtle underline underline-offset-4"
        >
          Sign in
        </Link>{" "}
        to keep a history.
      </>
    );
  }
  return <p className="text-center text-caption text-ink-tertiary">{content}</p>;
}
