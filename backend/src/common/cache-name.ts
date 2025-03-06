export function createCacheKey(...keys: string[]) {
  return keys.join(":");
}
