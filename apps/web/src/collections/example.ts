import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";

import { client, queryClient } from "@/utils/orpc";

export interface ExampleItem {
  createdAt: string;
  id: string;
  title: string;
}

// A single reactive, normalized collection for example items, backed by the
// oRPC list query. Reads are live (useLiveQuery), writes are optimistic with
// automatic rollback, and the underlying query refetches after each handler to
// reconcile the optimistic state with server truth. This is the on-ramp to
// local-first: swap queryCollectionOptions for an Electric/synced collection
// later without touching the components that read or mutate it.
export const exampleCollection = createCollection(
  queryCollectionOptions({
    getKey: (item: ExampleItem) => item.id,
    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          client.example.delete({ id: mutation.original.id })
        )
      );
    },
    onInsert: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          client.example.create({ title: mutation.modified.title })
        )
      );
    },
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          client.example.update({
            id: mutation.original.id,
            title: mutation.modified.title,
          })
        )
      );
    },
    queryClient,
    queryFn: async () => {
      const { items } = await client.example.list({ limit: 100 });
      return items.map((item) => ({
        createdAt: item.createdAt,
        id: item.id,
        title: item.title,
      }));
    },
    queryKey: ["examples", "collection"],
  })
);
