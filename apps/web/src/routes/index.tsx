import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { orpc } from "@/utils/orpc";

const TITLE_TEXT = `
 ██╗   ██╗██╗  ████████╗██╗███╗   ███╗ █████╗ ████████╗███████╗
 ██║   ██║██║  ╚══██╔══╝██║████╗ ████║██╔══██╗╚══██╔══╝██╔════╝
 ██║   ██║██║     ██║   ██║██╔████╔██║███████║   ██║   █████╗
 ██║   ██║██║     ██║   ██║██║╚██╔╝██║██╔══██║   ██║   ██╔══╝
 ╚██████╔╝███████╗██║   ██║██║ ╚═╝ ██║██║  ██║   ██║   ███████╗
  ╚═════╝ ╚══════╝╚═╝   ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

 ████████╗███████╗    ███████╗████████╗ █████╗ ██████╗ ████████╗███████╗██████╗
 ╚══██╔══╝██╔════╝    ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██╔══██╗
    ██║   ███████╗    ███████╗   ██║   ███████║██████╔╝   ██║   █████╗  ██████╔╝
    ██║   ╚════██║    ╚════██║   ██║   ██╔══██║██╔══██╗   ██║   ██╔══╝  ██╔══██╗
    ██║   ███████║    ███████║   ██║   ██║  ██║██║  ██║   ██║   ███████╗██║  ██║
    ╚═╝   ╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
 `;

const StatusShell = ({ children }: { children: ReactNode }) => (
  <div className="container mx-auto max-w-3xl px-4 py-2">
    <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
    <div className="grid gap-6">
      <section className="rounded-lg border p-4">
        <h2 className="mb-2 font-medium">API Status</h2>
        <div className="flex items-center gap-2">{children}</div>
      </section>
    </div>
  </div>
);

const HomeComponent = () => {
  // Prefetched in the route loader below, so there's no in-component loading
  // branch — the data is already in cache when this renders.
  const { data } = useSuspenseQuery(orpc.healthCheck.queryOptions());

  return (
    <StatusShell>
      <div className="h-2 w-2 rounded-full bg-green-500" />
      <span className="text-muted-foreground text-sm">Connected — {data}</span>
    </StatusShell>
  );
};

export const Route = createFileRoute("/")({
  component: HomeComponent,
  errorComponent: () => (
    <StatusShell>
      <div className="h-2 w-2 rounded-full bg-red-500" />
      <span className="text-muted-foreground text-sm">Disconnected</span>
    </StatusShell>
  ),
  // Load health status at the route level; a failed check throws to
  // errorComponent (Suspense + Error Boundary, not isLoading/isError).
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(orpc.healthCheck.queryOptions()),
});
