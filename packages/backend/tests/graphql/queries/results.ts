import { startProcess } from '../../../src/main/calculation/start-process';
import {
  getResultsForWorkspace,
  setResultVisibility
} from '../../../src/main/dashboards/results';
import {
  NumberInputNode,
  NumberOutputNode
} from '../../../src/main/nodes/number';
import { createConnection } from '../../../src/main/workspace/connections';
import { createNode } from '../../../src/main/workspace/nodes';
import { addOrUpdateFormValue } from '../../../src/main/workspace/nodes-detail';
import { createWorkspace } from '../../../src/main/workspace/workspace';
import { QueryTestCase } from '../../test-utils';
import { InMemoryCache } from '@masterthesis/shared';

export const resultsTest: QueryTestCase = {
  id: 'Results',
  query: `
      query Results($workspaceId: ID!) {
        results(workspaceId: $workspaceId) {
          id
          name
          lastChange
          created
          description
          results {
            id
            value
            type
            name
            description
            visible
            workspaceId
          }
          userId
        }
      }
    `,
  beforeTest: async reqContext => {
    const ws = await createWorkspace(
      'WS1',
      reqContext,
      'This is a description'
    );
    const a = await createNode(
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
      { name: 'value', nodeId: a.id },
      { name: 'value', nodeId: o.id },
      reqContext
    );
    await Promise.all([
      addOrUpdateFormValue(a.id, 'value', JSON.stringify(1), reqContext),
      addOrUpdateFormValue(
        o.id,
        'name',
        JSON.stringify('Straight through'),
        reqContext
      ),
      addOrUpdateFormValue(
        o.id,
        'description',
        JSON.stringify('Result description'),
        reqContext
      )
    ]);
    await startProcess(
      ws.id,
      { ...reqContext, cache: new InMemoryCache() },
      { awaitResult: true }
    );
    const allResults = await getResultsForWorkspace(ws.id, reqContext);
    await Promise.all(
      allResults.map(r => setResultVisibility(r.id, true, reqContext))
    );
    return { variables: { workspaceId: ws.id } };
  },
  expected: {
    results: {
      created: expect.any(Number),
      description: 'This is a description',
      id: expect.any(String),
      lastChange: expect.any(Number),
      name: 'WS1',
      results: [
        {
          description: 'Result description',
          id: expect.any(String),
          name: 'Straight through',
          value: 1,
          visible: true,
          workspaceId: expect.any(String)
        }
      ],
      userId: '123'
    }
  }
};
