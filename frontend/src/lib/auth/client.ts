"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/**
 * Talks to the same-origin proxy at /api/auth, which forwards to Neon Auth.
 * This SDK is the largest client dependency, so only import it from lazily loaded components.
 */
export const authClient = createAuthClient();
