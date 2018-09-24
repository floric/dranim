import { Log } from '../../logging';

export class InMemoryCache {
  private cache: Map<string, any> = new Map();
  private functionExecutions = 0;
  private cacheCalls = 0;

  public async tryGetOrFetch<T>(key: string, fetchFn: () => Promise<T>) {
    if (this.cache.has(key)) {
      this.cacheCalls++;
      return this.cache.get(key);
    }

    const res = await fetchFn();
    this.cache.set(key, res);
    this.functionExecutions++;
    return res;
  }

  public logUsage() {
    Log.info(`${this.cacheCalls} calls, ${this.functionExecutions} executions`);
  }
}
