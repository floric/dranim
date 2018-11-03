export class InMemoryCache {
  private cache: Map<string, any> = new Map();

  public async tryGetOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cachedRes = this.cache.get(key);
    if (cachedRes !== undefined) {
      return cachedRes;
    }

    const res = await fetchFn();
    this.cache.set(key, res);
    return res;
  }
}
