import { parseNodeForm } from '../src/utils';
import { NodeInstance, NodeState, FormValue } from '../src';

const createNodeWithForm = (form: Array<FormValue>): NodeInstance => ({
  id: '1',
  inputs: [],
  outputs: [],
  state: NodeState.VALID,
  type: 'Node',
  workspaceId: '2',
  x: 0,
  y: 0,
  form
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
});
