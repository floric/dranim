import {
  ContextNodeType,
  Dataset,
  DataType,
  NodeDef,
  NodeInstance,
  NodeState,
  parseNodeForm,
  ServerNodeDef,
  SocketState
} from '@masterthesis/shared';

import { getMetaInputs } from '../../../src/main/calculation/meta-execution';
import {
  areNodeInputsValid,
  isInputValid,
  isNodeInMetaValid
} from '../../../src/main/calculation/validation';
import { tryGetNodeType } from '../../../src/main/nodes/all-nodes';
import { getDataset } from '../../../src/main/workspace/dataset';
import { getInputDefs } from '../../../src/main/workspace/nodes-detail';
import { VALID_OBJECT_ID } from '../../test-utils';

jest.mock('@masterthesis/shared');
jest.mock('../../../src/main/nodes/all-nodes');
jest.mock('../../../src/main/workspace/nodes-detail');
jest.mock('../../../src/main/calculation/meta-execution');
jest.mock('../../../src/main/workspace/dataset');

describe('Validation', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  test('should validate simple nodes 1', async () => {
    const typeName = 'notype';
    const type: ServerNodeDef & NodeDef = {
      type: typeName,
      name: typeName,
      inputs: {
        value: {
          dataType: DataType.STRING,
          displayName: 'value',
          state: SocketState.STATIC
        }
      },
      outputs: {},
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    const node: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: typeName,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (getMetaInputs as jest.Mock).mockResolvedValue({
      value: {
        isPresent: true,
        content: {}
      }
    });
    (tryGetNodeType as jest.Mock).mockReturnValue(type);

    const res = await isNodeInMetaValid(node, { db: null, userId: '' });
    expect(res).toBe(true);
  });

  test('should validate simple nodes 2', async () => {
    const typeName = 'notype';
    const node: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: typeName,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (getInputDefs as jest.Mock).mockResolvedValue({});

    const res = await areNodeInputsValid(
      node,
      { value: 'test' },
      { db: null, userId: '' }
    );
    expect(res).toBe(true);
  });

  test('should validate nodes without connection as invalid', async () => {
    const typeName = 'notype';
    const type: ServerNodeDef & NodeDef = {
      type: typeName,
      name: typeName,
      inputs: {
        value: {
          dataType: DataType.STRING,
          displayName: 'value',
          state: SocketState.STATIC
        }
      },
      outputs: {},
      keywords: [],
      path: [],
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    const node: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: typeName,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (getMetaInputs as jest.Mock).mockResolvedValue({
      value: {
        isPresent: false,
        content: {}
      }
    });
    (tryGetNodeType as jest.Mock).mockReturnValue(type);

    const res = await isNodeInMetaValid(node, { db: null, userId: '' });
    expect(res).toBe(false);
  });

  test('should validate nodes without form input as invalid', async () => {
    const typeName = 'notype';
    const type: ServerNodeDef & NodeDef = {
      type: typeName,
      name: typeName,
      inputs: {
        value: {
          dataType: DataType.STRING,
          displayName: 'value',
          state: SocketState.STATIC
        }
      },
      outputs: {},
      keywords: [],
      path: [],
      isFormValid: async () => false,
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    const node: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: typeName,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (getMetaInputs as jest.Mock).mockResolvedValue({});
    (tryGetNodeType as jest.Mock).mockReturnValue(type);

    const res = await isNodeInMetaValid(node, { db: null, userId: '' });
    expect(res).toBe(false);
  });

  test('should validate context input nodes', async () => {
    const type: ServerNodeDef & NodeDef = {
      type: ContextNodeType.INPUT,
      name: ContextNodeType.INPUT,
      inputs: {
        value: {
          dataType: DataType.STRING,
          displayName: 'value',
          state: SocketState.STATIC
        }
      },
      outputs: {},
      keywords: [],
      path: [],
      isFormValid: async () => false,
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    const node: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: ContextNodeType.INPUT,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (getMetaInputs as jest.Mock).mockResolvedValue({});
    (tryGetNodeType as jest.Mock).mockReturnValue(type);

    const res = await isNodeInMetaValid(node, { db: null, userId: '' });
    expect(res).toBe(true);

    expect(parseNodeForm as jest.Mock).toHaveBeenCalledTimes(0);
    expect(tryGetNodeType as jest.Mock).toHaveBeenCalledTimes(0);
  });

  test('should validate context output nodes', async () => {
    const type: ServerNodeDef & NodeDef = {
      type: ContextNodeType.OUTPUT,
      name: ContextNodeType.OUTPUT,
      inputs: {
        value: {
          dataType: DataType.STRING,
          displayName: 'value',
          state: SocketState.STATIC
        }
      },
      outputs: {},
      keywords: [],
      path: [],
      isFormValid: async () => false,
      onMetaExecution: async () => ({}),
      onNodeExecution: async () => ({ outputs: {} })
    };
    const node: NodeInstance = {
      id: VALID_OBJECT_ID,
      contextIds: [],
      form: [],
      inputs: [],
      outputs: [],
      type: ContextNodeType.OUTPUT,
      workspaceId: VALID_OBJECT_ID,
      x: 0,
      y: 0,
      state: NodeState.VALID
    };

    (getMetaInputs as jest.Mock).mockResolvedValue({});
    (tryGetNodeType as jest.Mock).mockReturnValue(type);

    const res = await isNodeInMetaValid(node, { db: null, userId: '' });
    expect(res).toBe(true);

    expect(parseNodeForm as jest.Mock).toHaveBeenCalledTimes(0);
    expect(tryGetNodeType as jest.Mock).toHaveBeenCalledTimes(0);
  });

  test('should have invalid dataset input', async () => {
    (getInputDefs as jest.Mock).mockResolvedValue({
      dataset: {
        dataType: DataType.DATASET,
        displayName: 'dataset'
      }
    });

    const res = await areNodeInputsValid(
      {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID
      },
      {},
      { db: null, userId: '' }
    );
    expect(res).toBe(false);
  });

  test('should have dataset input with invalid id', async () => {
    (getInputDefs as jest.Mock).mockResolvedValue({
      dataset: {
        dataType: DataType.DATASET,
        displayName: 'dataset'
      }
    });

    const res = await areNodeInputsValid(
      {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID
      },
      { dataset: { datasetId: VALID_OBJECT_ID } },
      { db: null, userId: '' }
    );
    expect(res).toBe(false);
  });

  test('should have valid dataset input', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      entriesCount: 0,
      latestEntries: [],
      workspaceId: VALID_OBJECT_ID,
      valueschemas: []
    };
    (getInputDefs as jest.Mock).mockResolvedValue({
      dataset: {
        dataType: DataType.DATASET,
        displayName: 'dataset'
      }
    });
    (getDataset as jest.Mock).mockResolvedValue(ds);

    const res = await areNodeInputsValid(
      {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID
      },
      { dataset: { datasetId: VALID_OBJECT_ID } },
      { db: null, userId: '' }
    );
    expect(res).toBe(true);
  });

  test('should have invalid input with different name', async () => {
    (getInputDefs as jest.Mock).mockResolvedValue({
      else: {
        dataType: DataType.NUMBER,
        displayName: 'else'
      }
    });

    const res = await areNodeInputsValid(
      {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID
      },
      { test: 'abc' },
      { db: null, userId: '' }
    );
    expect(res).toBe(false);
  });

  test('should have valid and invalid input', async () => {
    const ds: Dataset = {
      id: VALID_OBJECT_ID,
      name: 'ds',
      entriesCount: 0,
      latestEntries: [],
      workspaceId: VALID_OBJECT_ID,
      valueschemas: []
    };
    (getInputDefs as jest.Mock).mockResolvedValue({
      datasetA: {
        dataType: DataType.DATASET,
        displayName: 'dsA'
      },
      datasetB: {
        dataType: DataType.DATASET,
        displayName: 'dsB'
      }
    });
    (getDataset as jest.Mock)
      .mockResolvedValueOnce(ds)
      .mockResolvedValueOnce(null);

    const res = await areNodeInputsValid(
      {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: [],
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID
      },
      {
        datasetA: { datasetId: ds.id },
        datasetB: { datasetId: null }
      },
      { db: null, userId: '' }
    );
    expect(res).toBe(false);
  });

  test('should have invalid input', async () => {
    let res = await isInputValid(undefined, DataType.STRING, {
      db: null,
      userId: ''
    });
    expect(res).toBe(false);

    res = await isInputValid(null, DataType.NUMBER, { db: null, userId: '' });
    expect(res).toBe(false);
  });

  test('should have valid number input', async () => {
    let res = await isInputValid(9.4523, DataType.NUMBER, {
      db: null,
      userId: ''
    });
    expect(res).toBe(true);

    res = await isInputValid(0, DataType.NUMBER, { db: null, userId: '' });
    expect(res).toBe(true);

    res = await isInputValid(-0.3, DataType.NUMBER, { db: null, userId: '' });
    expect(res).toBe(true);

    res = await isInputValid(11, DataType.NUMBER, { db: null, userId: '' });
    expect(res).toBe(true);
  });

  test('should have invalid number input', async () => {
    let res = await isInputValid(NaN, DataType.NUMBER, {
      db: null,
      userId: ''
    });
    expect(res).toBe(false);

    res = await isInputValid({}, DataType.NUMBER, { db: null, userId: '' });
    expect(res).toBe(false);

    res = await isInputValid('9', DataType.NUMBER, { db: null, userId: '' });
    expect(res).toBe(false);
  });

  test('should have valid string input', async () => {
    let res = await isInputValid('true', DataType.STRING, {
      db: null,
      userId: ''
    });
    expect(res).toBe(true);

    res = await isInputValid('', DataType.STRING, { db: null, userId: '' });
    expect(res).toBe(true);
  });

  test('should have invalid string input', async () => {
    let res = await isInputValid(9, DataType.STRING, { db: null, userId: '' });
    expect(res).toBe(false);

    res = await isInputValid({}, DataType.STRING, { db: null, userId: '' });
    expect(res).toBe(false);
  });

  test('should have valid boolean input', async () => {
    let res = await isInputValid(true, DataType.BOOLEAN, {
      db: null,
      userId: ''
    });
    expect(res).toBe(true);

    res = await isInputValid(false, DataType.BOOLEAN, { db: null, userId: '' });
    expect(res).toBe(true);
  });

  test('should have invalid boolean input', async () => {
    let res = await isInputValid('true', DataType.BOOLEAN, {
      db: null,
      userId: ''
    });
    expect(res).toBe(false);

    res = await isInputValid(0, DataType.BOOLEAN, { db: null, userId: '' });
    expect(res).toBe(false);
  });

  test('should have valid time input', async () => {
    const res = await isInputValid(new Date(), DataType.TIME, {
      db: null,
      userId: ''
    });
    expect(res).toBe(true);
  });

  test('should have invalid time input', async () => {
    const res = await isInputValid({}, DataType.TIME, { db: null, userId: '' });
    expect(res).toBe(false);
  });

  test('should have valid datetime input', async () => {
    const res = await isInputValid(new Date(), DataType.DATETIME, {
      db: null,
      userId: ''
    });
    expect(res).toBe(true);
  });

  test('should have invalid datetime input', async () => {
    const res = await isInputValid({}, DataType.DATETIME, {
      db: null,
      userId: ''
    });
    expect(res).toBe(false);
  });

  test('should return true for validation of unknown datatypes', async () => {
    const res = await isInputValid({}, 'test' as any, { db: null, userId: '' });
    expect(res).toBe(true);
  });
});
