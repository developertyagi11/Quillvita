"use client";

import { z } from "zod";

const TOKEN_ENDPOINT = "/api/auth/token";
const REFRESH_MARGIN_MS = 60_000;
const tokenResponseSchema = z.object({ token: z.string().min(1) });
const jwtPayloadSchema = z.object({ exp: z.number() });

let cached: { readonly token: string; readonly expiresAt: number } | null = null;

function expiryOf(token: string): number {
  try {
    const payload: unknown = JSON.parse(atob(token.split(".")[1] ?? ""));
    return jwtPayloadSchema.parse(payload).exp * 1000;
  } catch {
    return 0;
  }
}

/**
 * Short-lived (15 min) Neon Auth JWT for calling the FastAPI backend, or null when signed out.
 * Fetched directly because the SDK's `token()` can return its cached session object instead,
 * and kept apart from the SDK so API calls don't need to load it.
 */
export async function getAccessToken(): Promise<string | null> {
  if (cached && cached.expiresAt - REFRESH_MARGIN_MS > Date.now()) {
    return cached.token;
  }
  cached = null;
  try {
    const response = await fetch(TOKEN_ENDPOINT, { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) return null;
    const parsed = tokenResponseSchema.safeParse(await response.json());
    if (!parsed.success) return null;
    cached = { token: parsed.data.token, expiresAt: expiryOf(parsed.data.token) };
    return parsed.data.token;
  } catch {
    return null;
  }
}

export function clearAccessToken(): void {
  cached = null;
}
