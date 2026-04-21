import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { authClient } from "@/lib/auth-client";
import { authMiddleware } from "@/middleware/auth";

export const getPayment = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    // eslint-disable-next-line typescript/no-unsafe-type-assertion -- getRequestHeaders() type unresolved in lint env
    const requestHeaders: HeadersInit = getRequestHeaders() as HeadersInit;
    const { data: customerState } = await authClient.customer.state({
      fetchOptions: {
        headers: requestHeaders,
      },
    });
    return customerState;
  });
