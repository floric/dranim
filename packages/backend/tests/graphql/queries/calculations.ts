import { startProcess } from '../../../src/main/calculation/start-process';
import {
  NumberInputNode,
  NumberOutputNode
} from '../../../src/main/nodes/number';
import { createConnection } from '../../../src/main/workspace/connections';
import { createNode } from '../../../src/main/workspace/nodes';
import { addOrUpdateFormValue } from '../../../src/main/workspace/nodes-detail';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { QueryTestCase } from '../../test-utils';

export const calculationsTest: QueryTestCase = {
  id: 'Calculations',
  query: `
    query Calculations($workspaceId: ID!) {
      calculations(workspaceId: $workspaceId) {
        id
        start
        finish
        state
      }
    }
  `,
  beforeTest: async reqContext => {
    const ws = await createWorkspace(
      'WS1',
      reqContext,
      'This is a description'
    );
    const i = await createNode(
      NumberInputNode.type,
      ws.id,
      [],
      1,
      2,
      reqContext
    );
    const o = await createNode(
      NumberOutputNode.type,
      ws.id,
      [],
      7,
      8,
      reqContext
    );

    await createConnection(
      { name: 'value', nodeId: i.id },
      { name: 'value', nodeId: o.id },
      reqContext
    );
    await Promise.all([
      addOrUpdateFormValue(i.id, 'value', JSON.stringify(1), reqContext),
      addOrUpdateFormValue(
        o.id,
        'name',
        JSON.stringify('Easy task'),
        reqContext
      )
    ]);
    await startProcess(ws.id, reqContext, { awaitResult: true });
    return { variables: { workspaceId: ws.id } };
  },
  expected: {
    calculations: [
      {
        finish: expect.any(Number),
        id: expect.any(String),
        start: expect.any(Number),
        state: 'SUCCESSFUL'
      }
    ]
  }
};
