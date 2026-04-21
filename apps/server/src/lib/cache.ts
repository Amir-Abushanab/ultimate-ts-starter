import { env } from "@ultimate-ts-starter/env/server";

/**
 * Simple KV-backed cache for server-side data.
 * Falls back to no-op if KV_CACHE is not configured.
 *
 * Usage:
 *   const user = await cache.get("user:123", () => fetchUser("123"), 300);
 */

const getKV = (): KVNamespace | null => {
  try {
    return env.KV_CACHE ?? null;
  } catch {
    return null;
  }
};

export const cache = {
  /** Get a value, computing it on cache miss. TTL in seconds. */
  async get<T>(
    key: string,
    compute: () => Promise<T>,
    ttlSeconds = 60
  ): Promise<T> {
    const kv = getKV();
    if (kv) {
      const cached = await kv.get(key, "text");
      if (cached !== null) {
        // eslint-disable-next-line typescript/no-unsafe-type-assertion -- JSON.parse returns any; cached value was serialized from T
        return JSON.parse(cached) as unknown as T;
      }
    }

    const value = await compute();

    if (kv) {
      await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
    }

    return value;
  },

  /** Invalidate a cache key. */
  async invalidate(key: string) {
    const kv = getKV();
    if (kv) {
      await kv.delete(key);
    }
  },

  /** Invalidate all keys matching a prefix. */
  async invalidatePrefix(prefix: string) {
    const kv = getKV();
    if (!kv) {
      return;
    }
    const list = await kv.list({ prefix });
    await Promise.all(list.keys.map((k) => kv.delete(k.name)));
  },
};
