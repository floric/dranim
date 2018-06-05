import {
  EditEntriesNodeDef,
  FormValue,
  NodeInstance,
  NodeState,
  NumberInputNodeDef
} from '../src';
import { hasContextFn, isNumeric, parseNodeForm, sleep } from '../src/utils';

const createNodeWithForm = (form: Array<FormValue>): NodeInstance => ({
  id: '1',
  inputs: [],
  outputs: [],
  state: NodeState.VALID,
  type: 'Node',
  contextIds: [],
  workspaceId: '2',
  x: 0,
  y: 0,
  form,
  meta: {}
});

describe('Utils', () => {
  it('should parse empty node form', () => {
    const node = createNodeWithForm([]);

    const res = parseNodeForm(node);

    expect(Object.keys(res).length).toBe(0);
  });

  it('should parse valid node form', () => {
    const node = createNodeWithForm([
      { name: 'test', value: JSON.stringify(123) },
      { name: 'car', value: JSON.stringify('test') }
    ]);

    const res = parseNodeForm(node);

    expect(res.test).toBe(123);
    expect(res.car).toBe('test');
  });

  it('should not parse node form with values with duplicated names', () => {
    const node = createNodeWithForm([
      { name: 'test', value: JSON.stringify(123) },
      { name: 'test', value: JSON.stringify('test') }
    ]);

    expect(() => {
      parseNodeForm(node);
    }).toThrow(Error);

    expect(() => {
      parseNodeForm(node);
    }).toThrow('Duplicate form value names: test');
  });

  it('should not parse node form and throw error for invalid values', () => {
    const node = createNodeWithForm([
      { name: 'test', value: JSON.stringify(123) },
      { name: 'car', value: 'invalid-str' }
    ]);

    const res = parseNodeForm(node);

    expect(res.test).toBe(123);
    expect(res.car).toBe(null);
  });

  it('should be numeric', () => {
    expect(isNumeric(3)).toBe(true);
    expect(isNumeric(-3)).toBe(true);
    expect(isNumeric(3.14)).toBe(true);
    expect(isNumeric(34125)).toBe(true);
    expect(isNumeric('3')).toBe(true);
    expect(isNumeric('-3.14')).toBe(true);
  });

  it('should not be numeric', () => {
    expect(isNumeric('')).toBe(false);
    expect(isNumeric('a')).toBe(false);
    expect(isNumeric(null)).toBe(false);
    expect(isNumeric(undefined)).toBe(false);
    expect(isNumeric(NaN)).toBe(false);
  });

  it('should sleep', async () => {
    const now = new Date().getTime();
    await sleep(500);
    const later = new Date().getTime();

    expect(later - now).toBeGreaterThan(499);
  });

  it('should return true for node with context function', () => {
    const res = hasContextFn({
      name: 'test',
      isFormValid: () => Promise.resolve(true),
      isInputValid: () => Promise.resolve(true),
      onMetaExecution: () => Promise.resolve({}),
      onNodeExecution: () => Promise.resolve({ outputs: {} }),
      transformContextInputDefsToContextOutputDefs: () => Promise.resolve({}),
      transformInputDefsToContextInputDefs: () => Promise.resolve({})
    });
    expect(res).toBe(true);
  });

  it('should return false for node without context function', () => {
    const res = hasContextFn({
      name: 'test',
      isFormValid: () => Promise.resolve(true),
      isInputValid: () => Promise.resolve(true),
      onMetaExecution: () => Promise.resolve({}),
      onNodeExecution: () => Promise.resolve({ outputs: {} })
    });
    expect(res).toBe(false);
  });
});
