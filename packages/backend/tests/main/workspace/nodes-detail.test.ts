import {
  ContextNodeType,
  DataType,
  NodeDef,
  NodeInstance,
  NodeState,
  ServerNodeDefWithContextFn,
  SocketDef,
  SocketState,
  InMemoryCache
} from '@masterthesis/shared';
import { ObjectID } from 'mongodb';

import {
  getNodeType,
  hasNodeType,
  tryGetNodeType
} from '../../../src/main/nodes/all-nodes';
import {
  getNode,
  getNodesCollection,
  tryGetContextNode,
  tryGetNode
} from '../../../src/main/workspace/nodes';
import {
  addConnection,
  addOrUpdateFormValue,
  addOrUpdateVariable,
  deleteVariable,
  getContextInputDefs,
  getContextOutputDefs,
  getInputDefs,
  getOutputDefs,
  removeConnection,
  resetProgress,
  updateProgress
} from '../../../src/main/workspace/nodes-detail';
import { updateStates } from '../../../src/main/workspace/nodes-state';
import {
  doTestWithDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/workspace/nodes-state');
jest.mock('../../../src/main/nodes/all-nodes');
jest.mock('../../../src/main/calculation/validation');
jest.mock('../../../src/main/workspace/connections');

describe('Node Details', () => {
  test('should get empty object for nodes with type', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: 'testnode',
        contextIds: [],
        form: {},
        inputs: [{ name: 'dataset', connectionId: '123' }],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (hasNodeType as jest.Mock).mockReturnValue(true);

      const inputRes = await getContextInputDefs(node, {
        db,
        userId: '',
        cache: new InMemoryCache()
      });
      expect(inputRes).toEqual({});

      const outputRes = await getContextOutputDefs(node, {
        db,
        userId: '',
        cache: new InMemoryCache()
      });
      expect(outputRes).toEqual({});
    }));

  test('should throw error for missing parent node', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: 'testnode',
        contextIds: ['unknown id'],
        form: {},
        inputs: [{ name: 'dataset', connectionId: '123' }],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNode as jest.Mock).mockResolvedValue(null);
      (hasNodeType as jest.Mock).mockReturnValue(false);

      try {
        await getContextInputDefs(node, {
          db,
          userId: '',
          cache: new InMemoryCache()
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Parent node missing');
      }
    }));

  test('should get empty context inputs', () =>
    doTestWithDb(async db => {
      const parentTypeName = 'p';
      const parentType: ServerNodeDefWithContextFn & NodeDef = {
        type: parentTypeName,
        name: parentTypeName,
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
        onNodeExecution: async () => ({ outputs: {} }),
        transformContextInputDefsToContextOutputDefs: async () => ({}),
        transformInputDefsToContextInputDefs: async () => ({})
      };
      const parentNode: NodeInstance = {
        id: 'parentnode',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const inputNode: NodeInstance = {
        id: 'abc',
        contextIds: [parentNode.id],
        form: {},
        inputs: [],
        outputs: [],
        type: ContextNodeType.INPUT,
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNode as jest.Mock).mockResolvedValue(parentNode);
      (getNodeType as jest.Mock).mockReturnValue(parentType);
      (tryGetNodeType as jest.Mock).mockReturnValue(parentType);

      const inputRes = await getContextInputDefs(inputNode, {
        db,
        userId: '',
        cache: new InMemoryCache()
      });
      expect(inputRes).toEqual({});
    }));

  test('should get empty context outputs', () =>
    doTestWithDb(async db => {
      const parentTypeName = 'p';
      const parentType: ServerNodeDefWithContextFn & NodeDef = {
        type: parentTypeName,
        name: parentTypeName,
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
        onMetaExecution: async () => ({
          test: { content: {}, isPresent: true }
        }),
        onNodeExecution: async () => ({ outputs: {} }),
        transformContextInputDefsToContextOutputDefs: async () => ({}),
        transformInputDefsToContextInputDefs: async () => ({})
      };
      const parentNode: NodeInstance = {
        id: 'parentnode',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const inputNode: NodeInstance = {
        id: 'abc',
        contextIds: [parentNode.id],
        form: {},
        inputs: [],
        outputs: [],
        type: ContextNodeType.INPUT,
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNode as jest.Mock).mockResolvedValue(parentNode);
      (getNodeType as jest.Mock).mockReturnValue(parentType);
      (tryGetNodeType as jest.Mock).mockReturnValue(parentType);
      (tryGetContextNode as jest.Mock).mockResolvedValue(inputNode);

      const outputRes = await getContextOutputDefs(inputNode, {
        db,
        userId: '',
        cache: new InMemoryCache()
      });
      expect(outputRes).toEqual({});
    }));

  test('should throw error for missing context node in context', () =>
    doTestWithDb(async db => {
      const parentTypeName = 'p';
      const parentType: ServerNodeDefWithContextFn & NodeDef = {
        type: parentTypeName,
        name: parentTypeName,
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
        onMetaExecution: async () => ({
          test: { content: {}, isPresent: true }
        }),
        onNodeExecution: async () => ({ outputs: {} }),
        transformContextInputDefsToContextOutputDefs: async () => ({}),
        transformInputDefsToContextInputDefs: async () => ({})
      };
      const parentNode: NodeInstance = {
        id: 'parentnode',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const inputNode: NodeInstance = {
        id: 'abc',
        contextIds: [parentNode.id],
        form: {},
        inputs: [],
        outputs: [],
        type: ContextNodeType.INPUT,
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNode as jest.Mock).mockResolvedValue(parentNode);
      (getNodeType as jest.Mock).mockReturnValue(parentType);
      (tryGetNodeType as jest.Mock).mockReturnValue(parentType);
      (tryGetContextNode as jest.Mock).mockImplementation(() => {
        throw new Error('Unknown context node');
      });

      try {
        await getContextOutputDefs(inputNode, {
          db,
          userId: '',
          cache: new InMemoryCache()
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Unknown context node');
      }
    }));

  test('should throw error for node without context', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: 'abc',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: ContextNodeType.INPUT,
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };

      try {
        await getContextOutputDefs(node, {
          db,
          userId: '',
          cache: new InMemoryCache()
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Node doesnt have context');
      }
    }));

  test('should throw error for empty value names', () =>
    doTestWithDb(async db => {
      try {
        await addOrUpdateFormValue(VALID_OBJECT_ID, '', 'test', {
          db,
          userId: '',
          cache: new InMemoryCache()
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('No form value name specified');
      }
    }));

  test('should throw error for invalid node id', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNodesCollection as jest.Mock).mockReturnValue({
        updateOne: () => Promise.resolve({ result: { ok: 0 } })
      });
      (tryGetNode as jest.Mock).mockResolvedValueOnce(node);

      try {
        await addOrUpdateFormValue(VALID_OBJECT_ID, 'test', 'test', {
          db,
          userId: '',
          cache: new InMemoryCache()
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Adding or updating form value failed');
      }
    }));

  test('should get input defs for ContextOutputNode from context output defs from parent node', () =>
    doTestWithDb(async db => {
      const parentTypeName = 'parentnode';
      const parentNode: NodeInstance = {
        id: parentTypeName,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const parentType: ServerNodeDefWithContextFn & NodeDef = {
        type: parentTypeName,
        name: parentTypeName,
        inputs: {},
        outputs: {},
        keywords: [],
        path: [],
        isFormValid: async () => false,
        onMetaExecution: async () => ({
          test: { content: {}, isPresent: true }
        }),
        onNodeExecution: async () => ({ outputs: {} }),
        transformContextInputDefsToContextOutputDefs: async () => ({
          test: {
            dataType: DataType.DATETIME,
            displayName: 'date',
            state: SocketState.DYNAMIC
          }
        }),
        transformInputDefsToContextInputDefs: async () => ({})
      };
      const contextInputNode: NodeInstance = {
        id: 'abc',
        type: ContextNodeType.INPUT,
        contextIds: [parentNode.id],
        form: {},
        inputs: [],
        outputs: [],
        workspaceId: 'abc',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNode as jest.Mock).mockResolvedValueOnce(parentNode);
      (tryGetNodeType as jest.Mock).mockReturnValue(parentType);
      (hasNodeType as jest.Mock).mockReturnValueOnce(false);
      (tryGetContextNode as jest.Mock).mockReturnValue(contextInputNode);

      const res = await getInputDefs(
        {
          id: 'abc',
          type: ContextNodeType.OUTPUT,
          contextIds: [parentNode.id],
          form: {},
          inputs: [],
          outputs: [],
          workspaceId: 'abc',
          x: 0,
          y: 0,
          state: NodeState.VALID,
          progress: null,
          variables: {}
        },
        { db, userId: '', cache: new InMemoryCache() }
      );
      expect(res).toEqual({
        test: {
          dataType: DataType.DATETIME,
          displayName: 'date',
          state: SocketState.DYNAMIC
        }
      });
    }));

  test('should get output defs for ContextInputNode from context input defs from parent node', () =>
    doTestWithDb(async db => {
      const parentTypeName = 'parentnode';
      const parentNode: NodeInstance = {
        id: parentTypeName,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const parentType: ServerNodeDefWithContextFn & NodeDef = {
        type: parentTypeName,
        name: parentTypeName,
        inputs: {},
        outputs: {},
        keywords: [],
        path: [],
        isFormValid: async () => false,
        onMetaExecution: async () => ({
          test: { content: {}, isPresent: true }
        }),
        onNodeExecution: async () => ({ outputs: {} }),
        transformContextInputDefsToContextOutputDefs: async () => ({}),
        transformInputDefsToContextInputDefs: async () => ({
          test: {
            dataType: DataType.DATETIME,
            displayName: 'date',
            state: SocketState.DYNAMIC
          }
        })
      };
      const contextOutputNode: NodeInstance = {
        id: 'abc',
        type: ContextNodeType.OUTPUT,
        contextIds: [parentNode.id],
        form: {},
        inputs: [],
        outputs: [],
        workspaceId: 'abc',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNode as jest.Mock).mockResolvedValueOnce(parentNode);
      (tryGetNodeType as jest.Mock).mockReturnValue(parentType);
      (hasNodeType as jest.Mock).mockReturnValueOnce(false);
      (tryGetContextNode as jest.Mock).mockReturnValue(contextOutputNode);

      const res = await getOutputDefs(
        {
          id: 'abc',
          type: ContextNodeType.INPUT,
          contextIds: [parentNode.id],
          form: {},
          inputs: [],
          outputs: [],
          workspaceId: 'abc',
          x: 0,
          y: 0,
          state: NodeState.VALID,
          progress: null,
          variables: {}
        },
        { db, userId: '', cache: new InMemoryCache() }
      );
      expect(res).toEqual({
        test: {
          dataType: DataType.DATETIME,
          displayName: 'date',
          state: SocketState.DYNAMIC
        }
      });
    }));

  test('should get empty input defs for ContextInputNode', () =>
    doTestWithDb(async db => {
      const parentTypeName = 'parentnode';
      const parentNode: NodeInstance = {
        id: parentTypeName,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };

      const res = await getInputDefs(
        {
          id: 'abc',
          type: ContextNodeType.INPUT,
          contextIds: [parentNode.id],
          form: {},
          inputs: [{ connectionId: 'abc', name: 'test' }],
          outputs: [],
          workspaceId: 'abc',
          x: 0,
          y: 0,
          state: NodeState.VALID,
          progress: null,
          variables: {}
        },
        null
      );
      expect(res).toEqual({});
    }));

  test('should get empty output defs for ContextOutputNode', () =>
    doTestWithDb(async db => {
      const parentTypeName = 'parentnode';
      const parentNode: NodeInstance = {
        id: parentTypeName,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };

      const res = await getOutputDefs(
        {
          id: 'abc',
          type: ContextNodeType.OUTPUT,
          contextIds: [parentNode.id],
          form: {},
          inputs: [{ connectionId: 'abc', name: 'test' }],
          outputs: [],
          workspaceId: 'abc',
          x: 0,
          y: 0,
          state: NodeState.VALID,
          progress: null,
          variables: {}
        },
        null
      );
      expect(res).toEqual({});
    }));

  test('should add and remove connection from  node', () =>
    doTestWithDb(async db => {
      (getNodesCollection as jest.Mock).mockReturnValue({
        updateOne: jest.fn()
      });
      const node: NodeInstance = {
        id: 'node',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (tryGetNode as jest.Mock).mockResolvedValue(node);

      const nodeId = VALID_OBJECT_ID;
      await addConnection(
        { name: 'test', nodeId },
        { name: 'test', nodeId: VALID_OBJECT_ID },
        'input',
        VALID_OBJECT_ID,
        {
          db,
          userId: '',
          cache: new InMemoryCache()
        }
      );
      await addConnection(
        { name: 'test', nodeId },
        { name: 'test', nodeId: VALID_OBJECT_ID },
        'output',
        VALID_OBJECT_ID,
        {
          db,
          userId: '',
          cache: new InMemoryCache()
        }
      );
      await removeConnection(
        { name: 'test', nodeId },
        'input',
        VALID_OBJECT_ID,
        {
          db,
          userId: '',
          cache: new InMemoryCache()
        }
      );
      await removeConnection(
        { name: 'test', nodeId },
        'output',
        VALID_OBJECT_ID,
        {
          db,
          userId: '',
          cache: new InMemoryCache()
        }
      );
      expect(getNodesCollection(db).updateOne).toHaveBeenCalledTimes(4);
    }));

  test('should add variable if connection is a variable connection', () =>
    doTestWithDb(async db => {
      const targetNode: NodeInstance = {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const sourceNode: NodeInstance = {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const inputSocketDef: SocketDef = {
        displayName: 'abc',
        state: SocketState.STATIC,
        dataType: DataType.STRING
      };
      const contextNodeType: ServerNodeDefWithContextFn & NodeDef = {
        type: 'type',
        name: 'name',
        inputs: {},
        outputs: { test: inputSocketDef },
        keywords: [],
        path: [],
        isFormValid: async () => false,
        onMetaExecution: async () => ({}),
        onNodeExecution: async () => ({ outputs: {} }),
        transformContextInputDefsToContextOutputDefs: async () => ({}),
        transformInputDefsToContextInputDefs: async () => ({})
      };

      (getNodesCollection as jest.Mock).mockReturnValue({
        updateOne: jest.fn()
      });
      (tryGetNode as jest.Mock)
        .mockResolvedValueOnce(targetNode)
        .mockResolvedValueOnce(sourceNode);
      (getNodeType as jest.Mock).mockReturnValue(contextNodeType);
      (tryGetNodeType as jest.Mock).mockReturnValue(contextNodeType);

      await addConnection(
        { name: 'test', nodeId: targetNode.id },
        { name: 'test', nodeId: VALID_OBJECT_ID },
        'input',
        VALID_OBJECT_ID,
        { db, userId: '', cache: new InMemoryCache() }
      );

      expect(updateStates).toHaveBeenCalledTimes(1);
      expect(getNodesCollection(db).updateOne).toHaveBeenCalledTimes(2);
      expect(getNodesCollection(db).updateOne).toHaveBeenCalledWith(
        { _id: new ObjectID(VALID_OBJECT_ID) },
        {
          $set: {
            [`variables.test`]: {
              displayName: 'abc',
              dataType: DataType.STRING,
              state: SocketState.VARIABLE
            }
          }
        }
      );
    }));

  test('should add or update variable', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNodesCollection as jest.Mock).mockReturnValue({
        updateOne: jest.fn()
      });

      const res = await addOrUpdateVariable(
        '123',
        'test',
        DataType.STRING,
        node,
        { db, userId: '', cache: new InMemoryCache() }
      );

      expect(res).toBe(true);
      expect(updateStates).toHaveBeenCalledTimes(1);
      expect(getNodesCollection(db).updateOne).toHaveBeenCalledTimes(1);
    }));

  test('should delete variable', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNodesCollection as jest.Mock).mockReturnValue({
        updateOne: jest.fn()
      });

      const res = await deleteVariable('123', node, {
        db,
        userId: '',
        cache: new InMemoryCache()
      });

      expect(res).toBe(true);
      expect(updateStates).toHaveBeenCalledTimes(1);
      expect(getNodesCollection(db).updateOne).toHaveBeenCalledTimes(1);
      expect(getNodesCollection(db).updateOne).toHaveBeenCalledWith(
        { _id: new ObjectID(VALID_OBJECT_ID) },
        {
          $unset: { [`variables.123`]: '' }
        }
      );
    }));

  test('should also delete variable when deleting variable connection', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const contextNodeType: ServerNodeDefWithContextFn & NodeDef = {
        type: 'type',
        name: 'name',
        inputs: {},
        outputs: {},
        keywords: [],
        path: [],
        isFormValid: async () => false,
        onMetaExecution: async () => ({}),
        onNodeExecution: async () => ({ outputs: {} }),
        transformContextInputDefsToContextOutputDefs: async () => ({}),
        transformInputDefsToContextInputDefs: async () => ({})
      };
      (getNodesCollection as jest.Mock).mockReturnValue({
        updateOne: jest.fn()
      });
      (tryGetNode as jest.Mock).mockResolvedValue(node);
      (getNodeType as jest.Mock).mockReturnValue(contextNodeType);

      await removeConnection(
        { name: 'test', nodeId: VALID_OBJECT_ID },
        'input',
        VALID_OBJECT_ID,
        { db, userId: '', cache: new InMemoryCache() }
      );

      expect(updateStates).toHaveBeenCalledTimes(1);
      expect(getNodesCollection(db).updateOne).toHaveBeenCalledTimes(2);
      expect(getNodesCollection(db).updateOne).toHaveBeenCalledWith(
        { _id: new ObjectID(VALID_OBJECT_ID) },
        {
          $unset: { [`variables.test`]: '' }
        }
      );
    }));

  test('should update nodes progress', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNodesCollection as jest.Mock).mockReturnValue({
        updateOne: jest.fn(() => ({ modifiedCount: 1 }))
      });
      (tryGetNode as jest.Mock).mockResolvedValue(node);

      const res = await updateProgress(node.id, 50, {
        db,
        userId: '',
        cache: new InMemoryCache()
      });
      expect(res).toBe(true);

      expect(getNodesCollection(db).updateOne).toHaveBeenCalledTimes(1);
      expect(getNodesCollection(db).updateOne).toHaveBeenCalledWith(
        { _id: new ObjectID(VALID_OBJECT_ID) },
        {
          $set: {
            progress: 50
          }
        }
      );
    }));

  test('should not update nodes progress', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: VALID_OBJECT_ID,
        contextIds: [VALID_OBJECT_ID],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (getNodesCollection as jest.Mock).mockReturnValue({
        updateOne: jest.fn()
      });
      (tryGetNode as jest.Mock).mockResolvedValue(node);

      const res = await updateProgress(node.id, 50, {
        db,
        userId: '',
        cache: new InMemoryCache()
      });
      expect(res).toBe(true);

      expect(getNodesCollection(db).updateOne).not.toHaveBeenCalled();
    }));

  test('should throw error for to high progress value', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (tryGetNode as jest.Mock).mockResolvedValue(node);

      try {
        await updateProgress(node.id, 101, {
          db,
          userId: '',
          cache: new InMemoryCache()
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Progress value is invalid: 101');
      }
    }));

  test('should throw error for to low progress value', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: VALID_OBJECT_ID,
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'type',
        workspaceId: VALID_OBJECT_ID,
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      (tryGetNode as jest.Mock).mockResolvedValue(node);

      try {
        await updateProgress(node.id, -0.1, {
          db,
          userId: '',
          cache: new InMemoryCache()
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Progress value is invalid: -0.1');
      }
    }));

  test('should reset progress', () =>
    doTestWithDb(async db => {
      (getNodesCollection as jest.Mock).mockReturnValue({
        updateMany: jest.fn()
      });

      const res = await resetProgress(VALID_OBJECT_ID, {
        db,
        userId: '',
        cache: new InMemoryCache()
      });
      expect(res).toBe(true);
      expect(getNodesCollection(db).updateMany).toHaveBeenCalledTimes(1);
      expect(getNodesCollection(db).updateMany).toHaveBeenCalledWith(
        { workspaceId: VALID_OBJECT_ID },
        { $set: { progress: null } }
      );
    }));
});
