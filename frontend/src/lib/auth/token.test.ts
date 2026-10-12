import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAccessToken, getAccessToken } from "./token";

function jwtExpiringIn(seconds: number): string {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds }));
  return `header.${payload}.signature`;
}

function respondWith(status: number, body: unknown): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status }))),
  );
}

describe("getAccessToken", () => {
  beforeEach(() => clearAccessToken());
  afterEach(() => vi.unstubAllGlobals());

  it("returns the token from the auth proxy and reuses it while fresh", async () => {
    const token = jwtExpiringIn(900);
    respondWith(200, { token });

    expect(await getAccessToken()).toBe(token);
    expect(await getAccessToken()).toBe(token);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/auth/token", expect.anything());
  });

  it("fetches a new token when the cached one is about to expire", async () => {
    respondWith(200, { token: jwtExpiringIn(30) });

    await getAccessToken();
    await getAccessToken();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("returns null when signed out", async () => {
    respondWith(401, { message: "Unauthorized" });
    expect(await getAccessToken()).toBeNull();
  });

  it("returns null for an unexpected response body", async () => {
    respondWith(200, { session: {} });
    expect(await getAccessToken()).toBeNull();
  });

  it("returns null when the network fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("offline"))),
    );
    expect(await getAccessToken()).toBeNull();
  });
});
