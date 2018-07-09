import { FormValue, NodeInstance, NodeState } from '../src';
import {
  allAreDefinedAndPresent,
  hasContextFn,
  isNumeric,
  parseNodeForm,
  sleep
} from '../src/utils';

const createNodeWithForm = (form: Array<FormValue>): NodeInstance => ({
  id: '1',
  inputs: [],
  outputs: [],
  type: 'Node',
  contextIds: [],
  workspaceId: '2',
  x: 0,
  y: 0,
  form,
  state: NodeState.VALID
});

describe('Utils', () => {
  test('should parse empty node form', () => {
    const node = createNodeWithForm([]);

    const res = parseNodeForm(node.form);

    expect(Object.keys(res).length).toBe(0);
  });

  test('should parse valid node form', () => {
    const node = createNodeWithForm([
      { name: 'test', value: JSON.stringify(123) },
      { name: 'car', value: JSON.stringify('test') }
    ]);

    const res = parseNodeForm(node.form);

    expect(res.test).toBe(123);
    expect(res.car).toBe('test');
  });

  test('should not parse node form with values with duplicated names', () => {
    const node = createNodeWithForm([
      { name: 'test', value: JSON.stringify(123) },
      { name: 'test', value: JSON.stringify('test') }
    ]);

    expect(() => {
      parseNodeForm(node.form);
    }).toThrow(Error);

    expect(() => {
      parseNodeForm(node.form);
    }).toThrow('Duplicate form value names: test');
  });

  test('should not parse node form and throw error for invalid values', () => {
    const node = createNodeWithForm([
      { name: 'test', value: JSON.stringify(123) },
      { name: 'car', value: 'invalid-str' }
    ]);

    const res = parseNodeForm(node.form);

    expect(res.test).toBe(123);
    expect(res.car).toBe(null);
  });

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
});
