import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readSessionHint, setSessionHint, subscribeToSessionHint } from "@/lib/auth/session-hint";

type FakeStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function fakeWindow(): EventTarget & { localStorage: FakeStorage } {
  const values = new Map<string, string>();
  const localStorage: FakeStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
  return Object.assign(new EventTarget(), { localStorage });
}

describe("session hint", () => {
  beforeEach(() => vi.stubGlobal("window", fakeWindow()));
  afterEach(() => vi.unstubAllGlobals());

  it("remembers sign-in and sign-out", () => {
    expect(readSessionHint()).toBe(false);
    setSessionHint(true);
    expect(readSessionHint()).toBe(true);
    setSessionHint(false);
    expect(readSessionHint()).toBe(false);
  });

  it("notifies subscribers only when the value changes", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToSessionHint(onChange);
    setSessionHint(true);
    setSessionHint(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
    setSessionHint(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("treats blocked storage as signed out", () => {
    const blocked = Object.defineProperty(new EventTarget(), "localStorage", {
      get: () => {
        throw new Error("blocked");
      },
    });
    vi.stubGlobal("window", blocked);
    expect(readSessionHint()).toBe(false);
    expect(() => setSessionHint(true)).not.toThrow();
  });
});
