import { hc } from "hono/client";
import type { AppType } from "../../../server/src/index"; // Adjust path if needed, or better, export type from a shared package

// Since we are in a monorepo, we can import the type directly if configured, 
// but usually it's better to have a shared package or just relative import for MVP.
// However, importing from outside 'src' might cause issues with Vite unless configured.
// For now, let's assume we can import the type. 
// If not, we might need to move AppType to a shared package.

export const client = hc<AppType>("http://localhost:3000", {
    headers: {
        "Content-Type": "application/json",
    },
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        return fetch(input, {
            ...init,
            credentials: "include",
        });
    },
});
