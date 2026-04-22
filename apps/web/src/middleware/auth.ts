import { createMiddleware } from "@tanstack/react-start";

import { authClient } from "@/lib/auth-client";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    // Don't throw on auth errors — a failed session lookup (server down, network
    // hiccup, missing cookie) should just mean "unauthenticated" and let the
    // route's loader decide whether to redirect.
    const result = await authClient.getSession({
      fetchOptions: {
        headers: request.headers,
      },
    });
    return next({
      context: { session: result.data ?? null },
    });
  }
);
