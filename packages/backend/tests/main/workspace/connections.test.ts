import {
  ConnectionInstance,
  DataType,
  hasContextFn,
  NodeInstance,
  NodeState,
  SocketDef,
  SocketInstance,
  SocketState
} from '@masterthesis/shared';

import { Omit } from '../../../src/main';
import { getNodeType } from '../../../src/main/nodes/all-nodes';
import {
  createConnection,
  deleteConnection,
  deleteConnectionsInContext,
  getConnection,
  getConnectionsCollection,
  tryGetConnection
} from '../../../src/main/workspace/connections';
import { tryGetNode } from '../../../src/main/workspace/nodes';
import {
  getInputDefs,
  getOutputDefs
} from '../../../src/main/workspace/nodes-detail';
import { updateStates } from '../../../src/main/workspace/nodes-state';
import {
  doTestWithDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

jest.mock('@masterthesis/shared');
jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/workspace/nodes-detail');
jest.mock('../../../src/main/workspace/nodes-state');
jest.mock('../../../src/main/workspace/nodes-state');
jest.mock('../../../src/main/nodes/all-nodes');

describe('Connections', () => {
  test('should create and delete connection', () =>
    doTestWithDb(async db => {
      const nodeA: NodeInstance = {
        id: 'ida',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'abc',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const nodeB: NodeInstance = {
        id: 'idb',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'test',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const sourceSocket: SocketDef = {
        dataType: DataType.STRING,
        displayName: 'test',
        state: SocketState.STATIC
      };
      const destinationSocket: SocketDef = {
        dataType: DataType.STRING,
        displayName: 'test',
        state: SocketState.STATIC
      };

      (tryGetNode as jest.Mock)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB);
      (getOutputDefs as jest.Mock).mockResolvedValue({ val: sourceSocket });
      (getInputDefs as jest.Mock).mockResolvedValue({ val: destinationSocket });

      const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
      const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

      const newConn = await createConnection(fromSocket, toSocket, {
        db,
        userId: ''
      });

      expect(newConn.id).toBeDefined();
      expect(newConn.from).toEqual(fromSocket);
      expect(newConn.to).toEqual(toSocket);
      expect(newConn.workspaceId).toBe('123');
      expect(newConn.contextIds).toEqual([]);

      const tryConn = await tryGetConnection(newConn.id, {
        db,
        userId: ''
      });
      expect(tryConn).toEqual(newConn);

      const res = await deleteConnection(newConn.id, {
        db,
        userId: ''
      });
      expect(res).toBe(true);

      const unknownConn = await getConnection(newConn.id, {
        db,
        userId: ''
      });
      expect(unknownConn).toBe(null);
      expect(updateStates).toHaveBeenCalledTimes(2);
    }));

  test('should return null for invalid id', () =>
    doTestWithDb(async db => {
      const res = await getConnection('test', {
        db,
        userId: ''
      });
      expect(res).toBe(null);
    }));

  test('should throw error for unknown connection', () =>
    doTestWithDb(async db => {
      try {
        await tryGetConnection(VALID_OBJECT_ID, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Invalid connection');
      }
    }));

  test('should throw error for already existing connection', () =>
    doTestWithDb(async db => {
      const nodeA: NodeInstance = {
        id: 'ida',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'abc',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const nodeB: NodeInstance = {
        id: 'idb',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'test',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };

      const sourceSocket: SocketDef = {
        dataType: DataType.STRING,
        displayName: 'test',
        state: SocketState.STATIC
      };
      const destinationSocket: SocketDef = {
        dataType: DataType.STRING,
        displayName: 'test',
        state: SocketState.STATIC
      };

      (tryGetNode as jest.Mock)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB);
      (getOutputDefs as jest.Mock).mockResolvedValue({ test: sourceSocket });
      (getInputDefs as jest.Mock).mockResolvedValue({
        test: destinationSocket
      });

      await createConnection(
        { name: 'test', nodeId: nodeA.id },
        { name: 'test', nodeId: nodeB.id },
        {
          db,
          userId: ''
        }
      );

      try {
        await createConnection(
          { name: 'test', nodeId: nodeA.id },
          { name: 'test', nodeId: nodeB.id },
          {
            db,
            userId: ''
          }
        );
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Only one input allowed');
      }
    }));

  test('should create connection in context', () =>
    doTestWithDb(async db => {
      const node: NodeInstance = {
        id: 'ida',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'abc',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const nodeAinContext: NodeInstance = {
        id: 'idb-i',
        contextIds: [node.id],
        form: {},
        inputs: [],
        outputs: [],
        type: '123',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const nodeBinContext: NodeInstance = {
        id: 'idb-o',
        contextIds: [node.id],
        form: {},
        inputs: [],
        outputs: [],
        type: 'abc',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };

      (tryGetNode as jest.Mock)
        .mockResolvedValueOnce(nodeAinContext)
        .mockResolvedValueOnce(nodeBinContext);
      const sourceSocket: SocketDef = {
        dataType: DataType.STRING,
        displayName: 'test',
        state: SocketState.STATIC
      };
      const destinationSocket: SocketDef = {
        dataType: DataType.STRING,
        displayName: 'test',
        state: SocketState.STATIC
      };

      (tryGetNode as jest.Mock)
        .mockResolvedValueOnce(nodeAinContext)
        .mockResolvedValueOnce(nodeBinContext)
        .mockResolvedValueOnce(nodeAinContext)
        .mockResolvedValueOnce(nodeBinContext);
      (getOutputDefs as jest.Mock).mockResolvedValue({ val: sourceSocket });
      (getInputDefs as jest.Mock).mockResolvedValue({ val: destinationSocket });

      const fromSocket: SocketInstance = {
        name: 'val',
        nodeId: nodeAinContext.id
      };
      const toSocket: SocketInstance = {
        name: 'val',
        nodeId: nodeBinContext.id
      };

      const newConn = await createConnection(fromSocket, toSocket, {
        db,
        userId: ''
      });

      expect(newConn.id).toBeDefined();
      expect(newConn.from).toEqual(fromSocket);
      expect(newConn.to).toEqual(toSocket);
      expect(newConn.workspaceId).toBe('123');
      expect(newConn.contextIds).toEqual([node.id]);
    }));

  test('should error when trying to create invalid connection', () =>
    doTestWithDb(async db => {
      try {
        await createConnection(null, null, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Invalid connection');
      }
    }));

  test('should find cycle and prevent connection creation', () =>
    doTestWithDb(async db => {
      const nodeA: NodeInstance = {
        id: 'ida',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'abc',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const nodeB: NodeInstance = {
        id: 'idb',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'test',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };

      (tryGetNode as jest.Mock)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB);
      const sourceSocket: SocketDef = {
        dataType: DataType.STRING,
        displayName: 'test',
        state: SocketState.STATIC
      };
      const destinationSocket: SocketDef = {
        dataType: DataType.STRING,
        displayName: 'test',
        state: SocketState.STATIC
      };
      (getOutputDefs as jest.Mock).mockResolvedValue({ val: sourceSocket });
      (getInputDefs as jest.Mock).mockResolvedValue({ val: destinationSocket });

      const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
      const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

      const newConn = await createConnection(fromSocket, toSocket, {
        db,
        userId: ''
      });
      expect(newConn).not.toBe(null);

      try {
        await createConnection(toSocket, fromSocket, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Cyclic dependencies not allowed');
      }
    }));

  test('should not create connection for unknown nodes', () =>
    doTestWithDb(async db => {
      const nodeA: NodeInstance = {
        id: 'ida',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'abc',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };

      (tryGetNode as jest.Mock)
        .mockResolvedValueOnce(nodeA)
        .mockImplementationOnce(() => {
          throw new Error('Unknown node');
        });

      const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
      const toSocket: SocketInstance = {
        name: 'val',
        nodeId: VALID_OBJECT_ID
      };

      try {
        await createConnection(toSocket, fromSocket, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Unknown node');
      }
    }));

  test('should not create connection for nodes in different workspaces', () =>
    doTestWithDb(async db => {
      const nodeA: NodeInstance = {
        id: 'ida',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'abc',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const nodeB: NodeInstance = {
        id: 'idb',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'test',
        workspaceId: 'otherws',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };

      (tryGetNode as jest.Mock)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB);

      const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
      const toSocket: SocketInstance = {
        name: 'val',
        nodeId: nodeB.id
      };

      try {
        await createConnection(toSocket, fromSocket, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Nodes live in different workspaces');
      }
    }));

  test('should not create connection for nodes in different contexts', () =>
    doTestWithDb(async db => {
      const nodeA: NodeInstance = {
        id: 'ida',
        contextIds: ['id'],
        form: {},
        inputs: [],
        outputs: [],
        type: 'abc',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const nodeB: NodeInstance = {
        id: 'idb',
        contextIds: ['otherid'],
        form: {},
        inputs: [],
        outputs: [],
        type: 'test',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };

      (tryGetNode as jest.Mock)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB);

      const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
      const toSocket: SocketInstance = {
        name: 'val',
        nodeId: nodeB.id
      };

      try {
        await createConnection(toSocket, fromSocket, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Nodes live in different contexts');
      }
    }));

  test('should delete connections with context id', () =>
    doTestWithDb(async db => {
      const connectionsCollection = getConnectionsCollection<
        Omit<ConnectionInstance, 'id'>
      >(db);
      await connectionsCollection.insertOne({
        contextIds: ['randomid'],
        from: { name: '', nodeId: VALID_OBJECT_ID },
        to: { name: '', nodeId: VALID_OBJECT_ID },
        workspaceId: VALID_OBJECT_ID
      });
      await connectionsCollection.insertOne({
        contextIds: ['randomid', 'test'],
        from: { name: '', nodeId: VALID_OBJECT_ID },
        to: { name: '', nodeId: VALID_OBJECT_ID },
        workspaceId: VALID_OBJECT_ID
      });
      await connectionsCollection.insertOne({
        contextIds: ['abc', 'randomid', 'test'],
        from: { name: '', nodeId: VALID_OBJECT_ID },
        to: { name: '', nodeId: VALID_OBJECT_ID },
        workspaceId: VALID_OBJECT_ID
      });

      await deleteConnectionsInContext('randomid', {
        db,
        userId: ''
      });

      const count = await connectionsCollection.countDocuments();
      expect(count).toBe(0);
    }));

  test('should return true when deleting connection with unknown id to support parallel cleanups', () =>
    doTestWithDb(async db => {
      const res = await deleteConnection(VALID_OBJECT_ID, { db, userId: '' });
      expect(res).toBe(true);
    }));

  test('should throw error for non matching datatypes', () =>
    doTestWithDb(async db => {
      try {
        const nodeA: NodeInstance = {
          id: 'ida',
          contextIds: [],
          form: {},
          inputs: [],
          outputs: [],
          type: 'abc',
          workspaceId: '123',
          x: 0,
          y: 0,
          state: NodeState.VALID,
          progress: null,
          variables: {}
        };
        const nodeB: NodeInstance = {
          id: 'idb',
          contextIds: [],
          form: {},
          inputs: [],
          outputs: [],
          type: 'test',
          workspaceId: '123',
          x: 0,
          y: 0,
          state: NodeState.VALID,
          progress: null,
          variables: {}
        };
        const sourceSocket: SocketDef = {
          dataType: DataType.NUMBER,
          displayName: 'test',
          state: SocketState.STATIC
        };
        const destinationSocket: SocketDef = {
          dataType: DataType.STRING,
          displayName: 'test',
          state: SocketState.STATIC
        };

        (tryGetNode as jest.Mock)
          .mockResolvedValueOnce(nodeA)
          .mockResolvedValueOnce(nodeB)
          .mockResolvedValueOnce(nodeA)
          .mockResolvedValueOnce(nodeB);
        (getOutputDefs as jest.Mock).mockResolvedValue({ val: sourceSocket });
        (getInputDefs as jest.Mock).mockResolvedValue({
          val: destinationSocket
        });

        const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
        const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

        await createConnection(fromSocket, toSocket, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Datatypes dont match');
      }
    }));

  test('should throw error for unknown input socket', () =>
    doTestWithDb(async db => {
      try {
        const nodeA: NodeInstance = {
          id: 'ida',
          contextIds: [],
          form: {},
          inputs: [],
          outputs: [],
          type: 'abc',
          workspaceId: '123',
          x: 0,
          y: 0,
          state: NodeState.VALID,
          progress: null,
          variables: {}
        };
        const nodeB: NodeInstance = {
          id: 'idb',
          contextIds: [],
          form: {},
          inputs: [],
          outputs: [],
          type: 'test',
          workspaceId: '123',
          x: 0,
          y: 0,
          state: NodeState.VALID,
          progress: null,
          variables: {}
        };
        const sourceSocket: SocketDef = {
          dataType: DataType.STRING,
          displayName: 'test',
          state: SocketState.STATIC
        };

        (tryGetNode as jest.Mock)
          .mockResolvedValueOnce(nodeA)
          .mockResolvedValueOnce(nodeB)
          .mockResolvedValueOnce(nodeA)
          .mockResolvedValueOnce(nodeB);
        (getOutputDefs as jest.Mock).mockResolvedValue({ val: sourceSocket });
        (getInputDefs as jest.Mock).mockResolvedValue({});

        const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
        const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

        await createConnection(fromSocket, toSocket, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Unknown input socket');
      }
    }));

  test('should throw error for unknown output socket', () =>
    doTestWithDb(async db => {
      try {
        const nodeA: NodeInstance = {
          id: 'ida',
          contextIds: [],
          form: {},
          inputs: [],
          outputs: [],
          type: 'abc',
          workspaceId: '123',
          x: 0,
          y: 0,
          state: NodeState.VALID,
          progress: null,
          variables: {}
        };
        const nodeB: NodeInstance = {
          id: 'idb',
          contextIds: [],
          form: {},
          inputs: [],
          outputs: [],
          type: 'test',
          workspaceId: '123',
          x: 0,
          y: 0,
          state: NodeState.VALID,
          progress: null,
          variables: {}
        };
        const destinationSocket: SocketDef = {
          dataType: DataType.STRING,
          displayName: 'test',
          state: SocketState.STATIC
        };

        (tryGetNode as jest.Mock)
          .mockResolvedValueOnce(nodeA)
          .mockResolvedValueOnce(nodeB)
          .mockResolvedValueOnce(nodeA)
          .mockResolvedValueOnce(nodeB);
        (getOutputDefs as jest.Mock).mockResolvedValue({});
        (getInputDefs as jest.Mock).mockResolvedValue({
          val: destinationSocket
        });

        const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
        const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

        await createConnection(fromSocket, toSocket, {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Unknown output socket');
      }
    }));

  test('should skip type validation for context nodes and instead create variable', () =>
    doTestWithDb(async db => {
      const nodeA: NodeInstance = {
        id: 'ida',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'abc',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const nodeB: NodeInstance = {
        id: 'idb',
        contextIds: [],
        form: {},
        inputs: [],
        outputs: [],
        type: 'test',
        workspaceId: '123',
        x: 0,
        y: 0,
        state: NodeState.VALID,
        progress: null,
        variables: {}
      };
      const destinationSocket: SocketDef = {
        dataType: DataType.STRING,
        displayName: 'test',
        state: SocketState.STATIC
      };
      const contextType: NodeInstance = {
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

      (tryGetNode as jest.Mock)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB)
        .mockResolvedValueOnce(nodeA)
        .mockResolvedValueOnce(nodeB);
      (getOutputDefs as jest.Mock).mockResolvedValue({
        val: destinationSocket
      });
      (getNodeType as jest.Mock).mockReturnValue(contextType);
      (hasContextFn as any).mockReturnValue(true);

      const fromSocket: SocketInstance = { name: 'val', nodeId: nodeA.id };
      const toSocket: SocketInstance = { name: 'val', nodeId: nodeB.id };

      await createConnection(fromSocket, toSocket, {
        db,
        userId: ''
      });

      expect(hasContextFn).toHaveBeenCalledWith(contextType);
      expect(hasContextFn).toHaveBeenCalledTimes(1);
    }));
});
