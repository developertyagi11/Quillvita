"use client";

const STORAGE_KEY = "quillvita:signed-in";
const CHANGE_EVENT = "quillvita:session-hint";

/**
 * Whether this browser was signed in the last time the session was checked. It only decides
 * whether to load the auth client up front; the session itself is always verified by the SDK.
 */
export function readSessionHint(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSessionHint(signedIn: boolean): void {
  if (readSessionHint() === signedIn) return;
  try {
    if (signedIn) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToSessionHint(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
