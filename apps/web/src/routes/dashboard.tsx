import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import * as m from "@ultimate-ts-starter/i18n/messages";
import {
  AnimatedButton,
  AnimatedPage,
} from "@ultimate-ts-starter/ui/components/animated";

import { getPayment } from "@/functions/get-payment";
import { getUser } from "@/functions/get-user";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const RouteComponent = () => {
  const { session, customerState } = Route.useRouteContext();
  const privateData = useQuery(orpc.privateData.queryOptions());

  const hasProSubscription =
    (customerState?.activeSubscriptions?.length ?? 0) > 0;

  return (
    <AnimatedPage className="mx-auto w-full max-w-2xl p-6 space-y-4">
      <h1 className="text-3xl font-bold">{m.dashboard_title()}</h1>
      <p>{m.dashboard_welcome({ name: session?.user.name ?? "" })}</p>
      <p>API: {privateData.data?.message}</p>
      <p>{m.dashboard_plan({ plan: hasProSubscription ? "Pro" : "Free" })}</p>
      {hasProSubscription ? (
        <AnimatedButton
          onClick={() => {
            // eslint-disable-next-line typescript/no-unsafe-call -- Polar plugin augments authClient
            void authClient.customer.portal();
          }}
        >
          {m.dashboard_manage_sub()}
        </AnimatedButton>
      ) : (
        <AnimatedButton
          onClick={() => {
            // eslint-disable-next-line typescript/no-unsafe-call -- Polar plugin augments authClient
            void authClient.checkout({ slug: "pro" });
          }}
        >
          {m.dashboard_upgrade()}
        </AnimatedButton>
      )}
    </AnimatedPage>
  );
};

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getUser();
    const customerState = await getPayment();
    return { customerState, session };
  },
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
});
