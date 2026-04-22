/* eslint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-member-access, typescript/no-unsafe-call -- better-auth types unresolved in lint env */
import { createMiddleware } from "@tanstack/react-start";

import { authClient } from "@/lib/auth-client";

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    // Don't throw on auth errors — a failed session lookup (server down, network
    // hiccup, missing cookie) should just mean "unauthenticated" and let the
    // route's loader decide whether to redirect. Wrap in try/catch since
    // Better Auth can still throw on low-level fetch failures (ECONNREFUSED, etc).
    let session = null;
    try {
      // 5s cap — avoid hanging the SSR request if the auth server is unreachable.
      const result = await authClient.getSession({
        fetchOptions: {
          headers: request.headers,
          signal: AbortSignal.timeout(5000),
        },
      });
      session = result.data ?? null;
    } catch {
      // Network/auth error — treat as unauthenticated.
    }
    return next({
      context: { session },
    });
  }
);
