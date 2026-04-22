import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import type {
  AppRouter,
  AppRouterClient,
} from "@ultimate-ts-starter/api/routers/index";

export interface QueryConfig {
  /** Server base URL (e.g. env.VITE_SERVER_URL) */
  serverUrl: string;
  /** Error handler for failed queries */
  onError?: (error: Error, query: unknown) => void;
  /** Fetch credentials mode (default: "include") */
  credentials?: "include" | "omit" | "same-origin";
  /** Custom headers — called per-request (e.g. for manual cookie forwarding) */
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
}

export const createAppQueryClient = (config: QueryConfig) => {
  const credentials = config.credentials ?? "include";

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      // eslint-disable-next-line typescript/no-unsafe-type-assertion -- QueryCache onError type mismatch
      onError: config.onError as QueryCache["config"]["onError"],
    }),
  });

  // RPCLink expects a 5-arg fetch; we only need the first two. JS accepts extra args.
  /* eslint-disable typescript/no-explicit-any, typescript/no-unsafe-assignment, typescript/no-unsafe-call, typescript/no-unsafe-type-assertion */
  const wrappedFetch = ((request: Request, init?: RequestInit) =>
    globalThis.fetch(request, { ...init, credentials })) as any;
  /* eslint-enable typescript/no-explicit-any, typescript/no-unsafe-assignment, typescript/no-unsafe-call, typescript/no-unsafe-type-assertion */

  const link = new RPCLink({
    // eslint-disable-next-line typescript/no-unsafe-assignment -- see wrappedFetch above
    fetch: wrappedFetch,
    headers: config.headers,
    url: `${config.serverUrl}/rpc`,
  });

  const client: AppRouterClient = createORPCClient(link);
  const orpc = createTanstackQueryUtils(client);

  return { client, orpc, queryClient };
};

export { useRealtime, useEventStream } from "./use-event-stream.js";
export type { AppRouter, AppRouterClient };
