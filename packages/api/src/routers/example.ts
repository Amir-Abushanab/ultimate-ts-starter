import { protectedProcedure, publicProcedure } from "@ultimate-ts-starter/api";
import { z } from "zod";

/**
 * Example procedures demonstrating common data fetching patterns:
 * - Cursor-based pagination (infinite scroll)
 * - Mutations with input validation
 * - Simple queries
 *
 * Replace these with your actual domain procedures.
 */

const itemSchema = z.object({
  createdAt: z.string(),
  id: z.string(),
  title: z.string(),
});

type Item = z.infer<typeof itemSchema>;

// Fake data for demo — replace with real DB queries
const fakeItems: Item[] = Array.from({ length: 50 }, (_, i) => ({
  createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  id: `item-${String(i + 1).padStart(3, "0")}`,
  title: `Item ${i + 1}`,
}));

export const exampleRouter = {
  /** Create a new item (authenticated) */
  create: protectedProcedure
    .input(z.object({ title: z.string().min(1) }))
    .handler(({ input }) => {
      const item: Item = {
        createdAt: new Date().toISOString(),
        id: `item-${Date.now()}`,
        title: input.title,
      };
      fakeItems.unshift(item);
      return item;
    }),

  /** Delete an item (authenticated) */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(({ input }) => {
      const index = fakeItems.findIndex((i) => i.id === input.id);
      if (index === -1) {
        throw new Error("Not found");
      }
      fakeItems.splice(index, 1);
      return { deleted: true };
    }),

  /** Get a single item by ID */
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(({ input }) => {
      const item = fakeItems.find((i) => i.id === input.id);
      if (!item) {
        throw new Error("Not found");
      }
      return item;
    }),

  /** Cursor-based paginated list */
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .handler(({ input }) => {
      const { cursor, limit } = input;
      const startIndex =
        cursor === undefined
          ? 0
          : fakeItems.findIndex((item) => item.id === cursor) + 1;
      const items = fakeItems.slice(startIndex, startIndex + limit);
      const nextCursor =
        startIndex + limit < fakeItems.length ? items.at(-1)?.id : undefined;

      return { items, nextCursor };
    }),
};
