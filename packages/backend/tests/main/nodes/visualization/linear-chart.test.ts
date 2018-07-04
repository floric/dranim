import {
  DatasetSocket,
  DataType,
  Entry,
  LinearChartDef,
  LinearChartType,
  ValueSchema
} from '@masterthesis/shared';

import {
  getDynamicEntryContextInputs,
  processEntries
} from '../../../../src/main/nodes/entries/utils';
import { LinearChartNode } from '../../../../src/main/nodes/visualizations/linear-chart';
import { NODE, VALID_OBJECT_ID } from '../../../test-utils';

jest.mock('../../../../src/main/nodes/entries/utils');

describe('LinearChart', () => {
  test('should have correct properties', () => {
    expect(LinearChartNode.type).toBe(LinearChartDef.type);
    expect(LinearChartNode.isFormValid).toBeDefined();
    expect(LinearChartNode.isInputValid).toBeUndefined();
  });

  test('should have invalid form', async () => {
    let res = await LinearChartNode.isFormValid({
      name: '',
      description: '',
      type: LinearChartType.BAR
    });
    expect(res).toBe(false);

    res = await LinearChartNode.isFormValid({
      name: null,
      description: null,
      type: null
    });
    expect(res).toBe(false);

    res = await LinearChartNode.isFormValid({
      name: 'test',
      description: null,
      type: null
    });
    expect(res).toBe(false);

    res = await LinearChartNode.isFormValid({
      name: 'test',
      description: null,
      type: 'abc' as any
    });
    expect(res).toBe(false);
  });

  test('should have valid form', async () => {
    const res = await LinearChartNode.isFormValid({
      name: 'test',
      description: null,
      type: LinearChartType.BAR
    });
    expect(res).toBe(true);
  });

  test('should call getDynamicEntryContextInputs', async () => {
    (getDynamicEntryContextInputs as jest.Mock).mockReturnValue({});
    const res = await LinearChartNode.transformInputDefsToContextInputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: { content: { schema: [] }, isPresent: true } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({});
    expect(getDynamicEntryContextInputs as jest.Mock).toHaveBeenCalledTimes(1);
  });

  test('should have label and value outputs', async () => {
    const res = await LinearChartNode.transformContextInputDefsToContextOutputDefs(
      { dataset: DatasetSocket('Ds') },
      { dataset: { content: { schema: [] }, isPresent: true } },
      {},
      {},
      { description: '', type: LinearChartType.BAR, name: 'a' },
      { db: null, userId: '' }
    );
    expect(res).toEqual({
      label: { dataType: DataType.STRING, displayName: 'Label' },
      value: { dataType: DataType.NUMBER, displayName: 'Value' }
    });
  });

  test('should have empty meta result', async () => {
    const res = await LinearChartNode.onMetaExecution(
      { description: 'test', name: 'test', type: LinearChartType.BAR },
      { dataset: { content: { schema: [] }, isPresent: true } },
      { db: null, userId: '' }
    );
    expect(res).toEqual({});
  });

  test('should create result', async () => {
    const vs: ValueSchema = {
      name: 'val',
      type: DataType.NUMBER,
      fallback: '',
      unique: false,
      required: true
    };
    const entryA: Entry = {
      id: 'eA',
      values: { [vs.name]: 1 }
    };
    const entryB: Entry = {
      id: 'eB',
      values: { [vs.name]: 15 }
    };
    const entryC: Entry = {
      id: 'eC',
      values: { [vs.name]: 2 }
    };
    (processEntries as jest.Mock).mockImplementation(
      async (a, b, processFn) => {
        await processFn(entryA);
        await processFn(entryB);
        await processFn(entryC);
      }
    );

    const res = await LinearChartNode.onNodeExecution(
      { name: 'a', type: LinearChartType.BAR, description: '' },
      { dataset: { datasetId: VALID_OBJECT_ID } },
      {
        reqContext: { db: null, userId: '' },
        node: NODE,
        contextFnExecution: () =>
          Promise.resolve({
            outputs: { label: 'test', value: 9 }
          })
      }
    );

    expect(res).toEqual({
      outputs: {},
      results: {
        description: '',
        name: 'a',
        type: DataType.CUSTOM,
        value: {
          type: LinearChartType.BAR,
          values: [
            { label: 'test', value: 9 },
            { label: 'test', value: 9 },
            { label: 'test', value: 9 }
          ]
        },
        workspaceId: NODE.workspaceId
      }
    });
  });
});
