import { API_BASE_URL } from "@/lib/env";

/**
 * Fire-and-forget request that wakes a sleeping free-tier backend before the user submits.
 * Kept apart from `api-client` so the landing page doesn't ship the API schemas and auth client.
 */
export function warmUpBackend(): void {
  fetch(`${API_BASE_URL}/api/health`, { method: "GET" }).catch(() => undefined);
}
