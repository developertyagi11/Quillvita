import type { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";

const LOGIN_PATH = "/auth/sign-in";
const protect = auth.middleware({ loginUrl: LOGIN_PATH });

/** Protects signed-in pages and sends visitors back where they were after signing in. */
export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = await protect(request);
  const location = response.headers.get("location");
  if (!location) return response;

  const target = new URL(location, request.url);
  if (target.origin !== request.nextUrl.origin || target.pathname !== LOGIN_PATH) return response;

  const login = new URL(LOGIN_PATH, request.nextUrl.origin);
  login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  response.headers.set("location", login.toString());
  return response;
}

export const config = {
  matcher: ["/history/:path*"],
};
