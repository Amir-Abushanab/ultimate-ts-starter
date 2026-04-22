import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { authClient } from "@/lib/auth-client";
import { authMiddleware } from "@/middleware/auth";

export const getPayment = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // Skip the customer state call if we're not authenticated — saves a
    // round-trip and avoids hanging when the server is unreachable.
    if (!context.session) {
      return null;
    }
    // eslint-disable-next-line typescript/no-unsafe-type-assertion -- getRequestHeaders() type unresolved in lint env
    const requestHeaders: HeadersInit = getRequestHeaders() as HeadersInit;
    try {
      const { data: customerState } = await authClient.customer.state({
        fetchOptions: {
          headers: requestHeaders,
        },
      });
      return customerState;
    } catch {
      return null;
    }
  });
