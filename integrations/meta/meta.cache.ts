const DEFAULT_TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export function buildMetaCacheKey(parts: string[]): string {
  return `meta:${parts.join(":")}`;
}

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key);

  if (existing && existing.expiresAt > now) {
    return existing.value as T;
  }

  const value = await fetcher();
  cache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function setCached<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function clearMetaCache(): void {
  cache.clear();
}

export function invalidateMetaCache(keyPrefix = "meta:"): void {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) {
      cache.delete(key);
    }
  }
}
