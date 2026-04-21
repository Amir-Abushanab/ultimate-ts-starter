import type { RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "@ultimate-ts-starter/api";

import { accountRouter } from "./account";
import { exampleRouter } from "./example";

export const appRouter = {
  account: accountRouter,
  example: exampleRouter,
  healthCheck: publicProcedure.handler(() => "OK"),
  privateData: protectedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.session?.user,
  })),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
