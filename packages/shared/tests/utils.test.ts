import { NodeInstance, NodeState } from '../src';
import {
  allAreDefinedAndPresent,
  hasContextFn,
  isNumeric,
  sleep,
  InMemoryCache
} from '../src/utils';

describe('Utils', () => {
  test('should be numeric', () => {
    expect(isNumeric(3)).toBe(true);
    expect(isNumeric(-3)).toBe(true);
    expect(isNumeric(3.14)).toBe(true);
    expect(isNumeric(34125)).toBe(true);
    expect(isNumeric('3')).toBe(true);
    expect(isNumeric('-3.14')).toBe(true);
  });

  test('should not be numeric', () => {
    expect(isNumeric('')).toBe(false);
    expect(isNumeric('a')).toBe(false);
    expect(isNumeric(null)).toBe(false);
    expect(isNumeric(undefined)).toBe(false);
    expect(isNumeric(NaN)).toBe(false);
  });

  test('should sleep', async () => {
    const now = new Date().getTime();
    await sleep(500);
    const later = new Date().getTime();

    expect(later - now).toBeGreaterThan(499);
  });

  test('should return true for node with context function', () => {
    const res = hasContextFn({
      type: 'test',
      isFormValid: () => Promise.resolve(true),
      isInputValid: () => Promise.resolve(true),
      onMetaExecution: () => Promise.resolve({}),
      onNodeExecution: () => Promise.resolve({ outputs: {} }),
      transformContextInputDefsToContextOutputDefs: () => Promise.resolve({}),
      transformInputDefsToContextInputDefs: () => Promise.resolve({})
    });
    expect(res).toBe(true);
  });

  test('should return false for node without context function', () => {
    const res = hasContextFn({
      type: 'test',
      isFormValid: () => Promise.resolve(true),
      isInputValid: () => Promise.resolve(true),
      onMetaExecution: () => Promise.resolve({}),
      onNodeExecution: () => Promise.resolve({ outputs: {} })
    });
    expect(res).toBe(false);
  });

  test('should have valid inputs', async () => {
    let res = await allAreDefinedAndPresent({
      val: { isPresent: true, content: {} }
    });
    expect(res).toBe(true);

    res = await allAreDefinedAndPresent({
      valA: { isPresent: true, content: {} },
      valB: { isPresent: true, content: {} }
    });
    expect(res).toBe(true);
  });

  test('should have invalid inputs', async () => {
    const res = await allAreDefinedAndPresent({
      valA: { isPresent: true, content: {} },
      valB: { isPresent: false, content: {} }
    });
    expect(res).toBe(false);
  });

  test('should cache following calls', async () => {
    const fn = jest.fn();

    const cache = new InMemoryCache();
    await cache.tryGetOrFetch('test', async () => fn());
    await Promise.all([
      cache.tryGetOrFetch('test', async () => fn()),
      cache.tryGetOrFetch('test', async () => fn())
    ]);
    await cache.tryGetOrFetch('abc', async () => fn());
    await cache.tryGetOrFetch('abc', async () => fn());

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
