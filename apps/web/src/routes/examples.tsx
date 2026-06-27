import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
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

import { orpc } from "@/utils/orpc";

// ── Suspense query (data loads before render, no loading state in component) ──
const HealthStatus = () => {
  const { data } = useSuspenseQuery(orpc.healthCheck.queryOptions());
  return (
    <p className="text-sm">
      API status: <span className="font-medium">{data}</span>
    </p>
  );
};

// ── Infinite scroll with cursor pagination ──
const InfiniteList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      orpc.example.list.infiniteOptions({
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined,
        input: (pageParam: string | undefined) => ({
          cursor: pageParam,
          limit: 10,
        }),
      })
    );

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-3">
      <AnimatedList className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <Link
              to="/examples"
              search={(prev) => ({ ...prev, item: item.id })}
              className="text-start hover:opacity-80"
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.id}</p>
            </Link>
            <DeleteButton id={item.id} />
          </div>
        ))}
      </AnimatedList>

      {hasNextPage && (
        <AnimatedButton
          variant="outline"
          className="w-full"
          onClick={() => {
            void fetchNextPage();
          }}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </AnimatedButton>
      )}
    </div>
  );
};

// ── Delete button ──
const DeleteButton = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation(
    orpc.example.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: orpc.example.list.key(),
        });
      },
    })
  );

  return (
    <AnimatedButton
      variant="destructive"
      size="sm"
      onClick={() => {
        deleteMutation.mutate({ id });
      }}
      disabled={deleteMutation.isPending}
    >
      {deleteMutation.isPending ? "..." : "Delete"}
    </AnimatedButton>
  );
};

// ── Create form ──
const CreateForm = () => {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();
  const createMutation = useMutation(
    orpc.example.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: orpc.example.list.key(),
        });
      },
    })
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) {
          return;
        }
        createMutation.mutate({ title: title.trim() });
        setTitle("");
      }}
      className="flex gap-2"
    >
      <input
        required
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        placeholder="New item title..."
        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
      />
      <AnimatedButton type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Adding..." : "Add"}
      </AnimatedButton>
    </form>
  );
};

// ── Sortable data table ──
interface Item {
  id: string;
  title: string;
  createdAt: string;
}
const columnHelper = createColumnHelper<Item>();

const columns = [
  columnHelper.accessor("id", {
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground">
        {info.getValue()}
      </span>
    ),
    header: "ID",
  }),
  columnHelper.accessor("title", {
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    header: "Title",
  }),
  columnHelper.accessor("createdAt", {
    cell: (info) => (
      <span className="text-xs text-muted-foreground">
        {new Date(info.getValue()).toLocaleDateString()}
      </span>
    ),
    header: "Created",
  }),
];

const DataTable = () => {
  const { data } = useSuspenseQuery(
    orpc.example.list.queryOptions({ input: { limit: 10 } })
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    columns,
    data: data.items,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b bg-muted/50">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-start font-medium cursor-pointer select-none hover:bg-muted transition-colors"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{ asc: " ↑", desc: " ↓" }[
                    String(header.column.getIsSorted())
                  ] ?? ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b last:border-0 hover:bg-muted/30 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Route-driven overlay: the Sheet's open state lives entirely in the URL ──
// Clicking a list item sets `?item=<id>`; this reads it back. The drawer is
// shareable via URL and the browser back button closes it — "here's a route,
// make it a drawer."
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

    {/* Suspense: shows skeleton while health check loads */}
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">Suspense Query</h2>
      <Suspense fallback={<SkeletonCard />}>
        <HealthStatus />
      </Suspense>
    </section>

    {/* Create form with optimistic insert */}
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">Optimistic Create</h2>
      <CreateForm />
    </section>

    {/* Sortable data table */}
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">Sortable Table</h2>
      <Suspense fallback={<SkeletonList count={5} />}>
        <DataTable />
      </Suspense>
    </section>

    {/* Infinite scroll with optimistic delete */}
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">
        Cursor Pagination + Optimistic Delete
      </h2>
      <Suspense fallback={<SkeletonList count={5} />}>
        <InfiniteList />
      </Suspense>
    </section>

    {/* Route-driven overlay (URL-controlled Sheet) */}
    <ItemDetailsSheet />
  </AnimatedPage>
);

export const Route = createFileRoute("/examples")({
  component: ExamplesPage,
  // Prefetch the suspense queries on the server so SSR streams real data and
  // the client mounts without a fetch waterfall. The <Suspense> boundaries in
  // the component then resolve instantly from cache.
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(orpc.healthCheck.queryOptions()),
      context.queryClient.ensureQueryData(
        orpc.example.list.queryOptions({ input: { limit: 10 } })
      ),
    ]);
  },
  validateSearch: z.object({ item: z.string().optional() }),
});
