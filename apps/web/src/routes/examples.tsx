import { useLiveQuery } from "@tanstack/react-db";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AnimatedButton,
  AnimatedList,
  AnimatedPage,
} from "@ultimate-ts-starter/ui/components/animated";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@ultimate-ts-starter/ui/components/sheet";
import {
  SkeletonCard,
  SkeletonList,
} from "@ultimate-ts-starter/ui/components/skeletons";
import { Suspense, useState } from "react";
import { z } from "zod";

import { exampleCollection } from "@/collections/example";
import { orpc } from "@/utils/orpc";

// ── Suspense query: data loads in the route loader, so no loading state here ──
const HealthStatus = () => {
  const { data } = useSuspenseQuery(orpc.healthCheck.queryOptions());
  return (
    <p className="text-sm">
      API status: <span className="font-medium">{data}</span>
    </p>
  );
};

// ── Create form: optimistic insert. The row appears instantly; onInsert
//    persists via oRPC and the collection refetches to reconcile. ──
const CreateForm = () => {
  const [title, setTitle] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) {
          return;
        }
        exampleCollection.insert({
          createdAt: new Date().toISOString(),
          id: crypto.randomUUID(),
          title: trimmed,
        });
        setTitle("");
      }}
    >
      <input
        required
        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        placeholder="New item title..."
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <AnimatedButton type="submit">Add</AnimatedButton>
    </form>
  );
};

// ── Live list: useLiveQuery is reactive, so optimistic insert/delete reflect
//    here instantly without manual cache invalidation. ──
const LiveItems = () => {
  const { data: items, isLoading } = useLiveQuery((q) =>
    q.from({ example: exampleCollection })
  );

  if (isLoading) {
    return <SkeletonList count={5} />;
  }

  return (
    <AnimatedList className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <Link
            className="text-start hover:opacity-80"
            search={(prev) => ({ ...prev, item: item.id })}
            to="/examples"
          >
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.id}</p>
          </Link>
          <AnimatedButton
            size="sm"
            variant="destructive"
            onClick={() => {
              exampleCollection.delete(item.id);
            }}
          >
            Delete
          </AnimatedButton>
        </div>
      ))}
    </AnimatedList>
  );
};

// ── Route-driven overlay: the Sheet's open state lives entirely in the URL.
//    Clicking an item sets `?item=<id>`; this reads it back. ──
const ItemDetailsSheet = () => {
  const { item } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <Sheet
      open={item !== undefined}
      onOpenChange={(open) => {
        if (!open) {
          void navigate({ search: (prev) => ({ ...prev, item: undefined }) });
        }
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Item details</SheetTitle>
          <SheetDescription>
            Opened from the <code>?item=</code> URL param — shareable, and the
            browser back button closes it.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <p className="font-mono text-xs text-muted-foreground">{item}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ── Page: ties everything together ──
const ExamplesPage = () => (
  <AnimatedPage className="mx-auto w-full max-w-2xl space-y-6 p-6">
    <h1 className="text-3xl font-bold">Data Fetching Examples</h1>

    <section className="space-y-2">
      <h2 className="text-lg font-semibold">Suspense Query</h2>
      <Suspense fallback={<SkeletonCard />}>
        <HealthStatus />
      </Suspense>
    </section>

    <section className="space-y-2">
      <h2 className="text-lg font-semibold">
        TanStack DB — live query + optimistic mutations
      </h2>
      <CreateForm />
      <LiveItems />
    </section>

    {/* Route-driven overlay (URL-controlled Sheet) */}
    <ItemDetailsSheet />
  </AnimatedPage>
);

export const Route = createFileRoute("/examples")({
  component: ExamplesPage,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(orpc.healthCheck.queryOptions()),
  validateSearch: z.object({ item: z.string().optional() }),
});
