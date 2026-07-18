import { useLiveQuery } from "@tanstack/react-db";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
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
import { ErrorBoundary } from "@/components/error-boundary";
import { orpc } from "@/utils/orpc";

const PAGE_SIZE = 8;
const INPUT_CLASS =
  "flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type SortKey = "createdAt" | "title";
type SortDir = "asc" | "desc";

// ── Suspense query: data loads in the route loader, so no loading state here ──
const HealthStatus = () => {
  const { data } = useSuspenseQuery(orpc.healthCheck.queryOptions());
  return (
    <p className="text-sm">
      API status: <span className="font-medium">{data}</span>
    </p>
  );
};

const sortArrow = (active: boolean, dir: SortDir) => {
  if (!active) {
    return "";
  }
  return dir === "asc" ? " ↑" : " ↓";
};

// ── TanStack DB manager: live reactive list + optimistic create/edit/delete,
//    with client-side filter, sort, and pagination over the live collection.
//    CLIENT-ONLY because useLiveQuery isn't server-renderable. ──
const ExampleManager = () => {
  const { data: items } = useLiveQuery((q) =>
    q.from({ example: exampleCollection })
  );

  const [newTitle, setNewTitle] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // filter → sort → paginate, recomputed live as the collection changes.
  const term = search.trim().toLowerCase();
  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(term)
  );
  const sorted = [...filtered].toSorted((a, b) => {
    const cmp =
      sortKey === "title"
        ? a.title.localeCompare(b.title)
        : a.createdAt.localeCompare(b.createdAt);
    return sortDir === "asc" ? cmp : -cmp;
  });
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = sorted.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "createdAt" ? "desc" : "asc");
    }
    setPage(0);
  };

  return (
    <div className="space-y-3">
      {/* Create — optimistic insert (instant, then persisted + reconciled) */}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const title = newTitle.trim();
          if (!title) {
            return;
          }
          exampleCollection.insert({
            createdAt: new Date().toISOString(),
            id: crypto.randomUUID(),
            title,
          });
          setNewTitle("");
        }}
      >
        <input
          aria-label="New item title"
          className={INPUT_CLASS}
          placeholder="New item title..."
          required
          value={newTitle}
          onChange={(e) => {
            setNewTitle(e.target.value);
          }}
        />
        <AnimatedButton type="submit">Add</AnimatedButton>
      </form>

      {/* Filter + sort controls */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="Filter items by title"
          className={INPUT_CLASS}
          placeholder="Filter by title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <AnimatedButton
          size="sm"
          variant="outline"
          onClick={() => {
            toggleSort("title");
          }}
        >
          Title{sortArrow(sortKey === "title", sortDir)}
        </AnimatedButton>
        <AnimatedButton
          size="sm"
          variant="outline"
          onClick={() => {
            toggleSort("createdAt");
          }}
        >
          Date{sortArrow(sortKey === "createdAt", sortDir)}
        </AnimatedButton>
        <span
          className="text-xs text-muted-foreground"
          data-testid="item-count"
        >
          {sorted.length} items
        </span>
      </div>

      {/* Live list with inline edit + delete */}
      <AnimatedList className="space-y-2">
        {pageItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-lg border p-3"
          >
            {editingId === item.id ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const title = editTitle.trim();
                  if (!title) {
                    return;
                  }
                  exampleCollection.update(item.id, (draft) => {
                    draft.title = title;
                  });
                  setEditingId(null);
                }}
              >
                <input
                  aria-label="Edit item title"
                  className={INPUT_CLASS}
                  required
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                  }}
                />
                <AnimatedButton size="sm" type="submit">
                  Save
                </AnimatedButton>
                <AnimatedButton
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                  }}
                >
                  Cancel
                </AnimatedButton>
              </form>
            ) : (
              <>
                <Link
                  className="text-start hover:opacity-80"
                  search={(prev) => ({ ...prev, item: item.id })}
                  to="/examples"
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.id}</p>
                </Link>
                <div className="flex gap-2">
                  <AnimatedButton
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditTitle(item.title);
                    }}
                  >
                    Edit
                  </AnimatedButton>
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
              </>
            )}
          </div>
        ))}
      </AnimatedList>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <AnimatedButton
          disabled={currentPage === 0}
          size="sm"
          variant="outline"
          onClick={() => {
            setPage(currentPage - 1);
          }}
        >
          Previous
        </AnimatedButton>
        <span
          className="text-xs text-muted-foreground"
          data-testid="page-status"
        >
          Page {currentPage + 1} of {pageCount}
        </span>
        <AnimatedButton
          disabled={currentPage >= pageCount - 1}
          size="sm"
          variant="outline"
          onClick={() => {
            setPage(currentPage + 1);
          }}
        >
          Next
        </AnimatedButton>
      </div>
    </div>
  );
};

// Suspense-fetched detail for the selected item. `example.get` is a public
// oRPC procedure (SSR-safe), so a Suspense boundary covers loading and an
// ErrorBoundary covers a missing/invalid id — no isPending/isError branch.
const ItemDetails = ({ id }: { id: string }) => {
  const { data } = useSuspenseQuery(
    orpc.example.get.queryOptions({ input: { id } })
  );
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{data.title}</p>
      <p className="font-mono text-xs text-muted-foreground">{data.id}</p>
      <p className="text-xs text-muted-foreground">
        Created {new Date(data.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

// ── Route-driven overlay: the Sheet's open state lives entirely in the URL.
//    Clicking an item sets `?item=<id>`; this reads it back and Suspense-loads
//    the item's details. ──
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
          {item !== undefined && (
            <ErrorBoundary
              fallback={
                <p className="text-sm text-destructive">
                  Could not load this item.
                </p>
              }
            >
              <Suspense fallback={<SkeletonCard />}>
                <ItemDetails key={item} id={item} />
              </Suspense>
            </ErrorBoundary>
          )}
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
        TanStack DB — live query + optimistic CRUD, filter, sort, paginate
      </h2>
      <ClientOnly fallback={<SkeletonList count={PAGE_SIZE} />}>
        <ExampleManager />
      </ClientOnly>
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
