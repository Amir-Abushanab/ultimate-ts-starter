import { createFileRoute, redirect } from "@tanstack/react-router";
import * as m from "@ultimate-ts-starter/i18n/messages";
import { AnimatedPage } from "@ultimate-ts-starter/ui/components/animated";

import AccountData from "@/components/account-data";
import NotificationPreferences from "@/components/notification-preferences";
import TwoFactorSetup from "@/components/two-factor-setup";
import { getUser } from "@/functions/get-user";

const RouteComponent = () => (
  <AnimatedPage className="mx-auto w-full max-w-2xl p-6 space-y-8">
    <h1 className="text-3xl font-bold">{m.settings_title()}</h1>
    <TwoFactorSetup />
    <hr />
    <NotificationPreferences />
    <hr />
    <AccountData />
  </AnimatedPage>
);

export const Route = createFileRoute("/settings")({
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
});
