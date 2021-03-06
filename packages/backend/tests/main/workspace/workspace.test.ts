import { NodeState, sleep } from '@masterthesis/shared';

import { getConnectionsCollection } from '../../../src/main/workspace/connections';
import {
  getAllNodes,
  getNodesCollection
} from '../../../src/main/workspace/nodes';
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspace,
  getWorkspaceState,
  renameWorkspace,
  tryGetWorkspace,
  updateLastChange
} from '../../../src/main/workspace/workspace';
import {
  doTestWithDb,
  NeverGoHereError,
  VALID_OBJECT_ID
} from '../../test-utils';

jest.mock('../../../src/main/workspace/nodes');
jest.mock('../../../src/main/workspace/connections');

describe('Workspaces', () => {
  test('should create and delete workspace', () =>
    doTestWithDb(async db => {
      (getNodesCollection as jest.Mock).mockReturnValue({
        deleteMany: jest.fn()
      });
      (getConnectionsCollection as jest.Mock).mockReturnValue({
        deleteMany: jest.fn()
      });

      const description = 'desc';
      const name = 'wsname';

      const ws = await createWorkspace(
        name,
        {
          db,
          userId: ''
        },
        description
      );

      expect(ws.id).toBeDefined();
      expect(ws.created).toBeDefined();
      expect(ws.description).toBe(description);
      expect(ws.name).toEqual(name);
      expect(ws.lastChange).toBeDefined();

      const createdWs = await getWorkspace(ws.id, {
        db,
        userId: ''
      });
      expect(createdWs).toEqual(ws);

      const res = await deleteWorkspace(ws.id, {
        db,
        userId: ''
      });

      expect(res).toBe(true);

      const unknownWs = await getWorkspace(ws.id, {
        db,
        userId: ''
      });

      expect(unknownWs).toBe(null);

      expect(getNodesCollection(db).deleteMany).toHaveBeenCalledTimes(1);
      expect(getConnectionsCollection(db).deleteMany).toHaveBeenCalledTimes(1);
    }));

  test('should rename workspace with trimmed name', () =>
    doTestWithDb(async db => {
      const ds = await createWorkspace('test   ', { db, userId: '' });

      const res = await renameWorkspace(ds.id, 'new', { db, userId: '' });

      const dsNew = await tryGetWorkspace(ds.id, { db, userId: '' });
      expect(res).toBe(true);
      expect(ds.name).toBe('test');
      expect(dsNew.name).toBe('new');
    }));

  test('should throw exception when trying to rename workspace with empty name', () =>
    doTestWithDb(async db => {
      const ds = await createWorkspace('test', { db, userId: '' });

      try {
        await renameWorkspace(ds.id, '', { db, userId: '' });
      } catch (err) {
        expect(err.message).toBe('Name must not be empty.');
      }
    }));

  test('should throw exception for unknown workspace', () =>
    doTestWithDb(async db => {
      try {
        await renameWorkspace(VALID_OBJECT_ID, 'test', { db, userId: '' });
      } catch (err) {
        expect(err.message).toBe('Unknown workspace');
      }
    }));

  test('should throw error when trying to get unknown workspace', () =>
    doTestWithDb(async db => {
      try {
        await tryGetWorkspace('test', { db, userId: '123' });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toBe('Unknown workspace');
      }
    }));

  test('should not find workspace from other user', () =>
    doTestWithDb(async db => {
      const ws = await createWorkspace('test', {
        db,
        userId: 'abc'
      });

      const foundWs = await getWorkspace(ws.id, { db, userId: '123' });
      expect(foundWs).toBe(null);
    }));

  test('should try to get workspace', () =>
    doTestWithDb(async db => {
      const ws = await createWorkspace('test', {
        db,
        userId: '123'
      });

      const res = await tryGetWorkspace(ws.id, { db, userId: '123' });
      expect(res).toEqual(ws);
    }));

  test('should not create workspace with empty name', () =>
    doTestWithDb(async db => {
      const description = 'desc';
      const name = '';

      try {
        await createWorkspace(
          name,
          {
            db,
            userId: ''
          },
          description
        );
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toEqual('Name of workspace must not be empty.');
      }
    }));

  test('should not delete unknown workspace', () =>
    doTestWithDb(async db => {
      try {
        await deleteWorkspace('abc', {
          db,
          userId: ''
        });
        throw NeverGoHereError;
      } catch (err) {
        expect(err.message).toEqual('Deletion of Workspace failed.');
      }
    }));

  test('should get all workspaces', () =>
    doTestWithDb(async db => {
      await Promise.all([
        createWorkspace(
          'a',
          {
            db,
            userId: ''
          },
          'aDesc'
        ),
        createWorkspace(
          'b',
          {
            db,
            userId: ''
          },
          'bDesc'
        ),
        createWorkspace(
          'c',
          {
            db,
            userId: ''
          },
          'cDesc'
        )
      ]);

      const allWs = await getAllWorkspaces({
        db,
        userId: ''
      });

      expect(allWs.length).toBe(3);

      const wsA = allWs.filter(n => n.name === 'a');
      expect(wsA.length).toBe(1);
    }));

  test('should update last change of workspace', () =>
    doTestWithDb(async db => {
      const ws = await createWorkspace(
        'test',
        {
          db,
          userId: ''
        },
        ''
      );

      await sleep(100);
      await updateLastChange(ws.id, {
        db,
        userId: ''
      });

      const newWs = await getWorkspace(ws.id, {
        db,
        userId: ''
      });
      expect(new Date(newWs.lastChange).getTime()).toBeGreaterThan(
        new Date(ws.lastChange).getTime()
      );
    }));

  test('should have valid workspace state without nodes', () =>
    doTestWithDb(async db => {
      (getAllNodes as jest.Mock).mockResolvedValue([]);

      const res = await getWorkspaceState('dsID', { userId: '', db });
      expect(res).toBe(NodeState.VALID);
    }));

  test('should have invalid workspace state with valid and invalid nodes', () =>
    doTestWithDb(async db => {
      (getAllNodes as jest.Mock).mockResolvedValue([
        { state: NodeState.VALID },
        { state: NodeState.INVALID },
        { state: NodeState.VALID }
      ]);

      const res = await getWorkspaceState('dsID', { userId: '', db });
      expect(res).toBe(NodeState.INVALID);
    }));

  test('should have valid workspace state with valid and invalid nodes', () =>
    doTestWithDb(async db => {
      (getAllNodes as jest.Mock).mockResolvedValue([
        { state: NodeState.VALID },
        { state: NodeState.VALID }
      ]);

      const res = await getWorkspaceState('dsID', { userId: '', db });
      expect(res).toBe(NodeState.VALID);
    }));
});
