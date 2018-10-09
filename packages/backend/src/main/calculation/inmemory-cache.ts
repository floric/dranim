export class InMemoryCache {
  private cache: Map<string, any> = new Map();

  public async tryGetOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const res = await fetchFn();
    this.cache.set(key, res);
    return res;
  }
}
