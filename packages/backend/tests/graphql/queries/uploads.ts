import { DataType } from '@masterthesis/shared';
import { Readable } from 'stream';

import {
  addValueSchema,
  createDataset
} from '../../../src/main/workspace/dataset';
import { uploadEntriesCsv } from '../../../src/main/workspace/upload';
import { QueryTestCase } from '../../test-utils';

class Counter extends Readable {
  private max: number = 150;
  private index: number = 1;

  public _read() {
    const i = this.index++;
    if (i > this.max) {
      this.push(null);
    } else if (i > 75) {
      this.push(`invalid\n`);
    } else {
      const buf = Buffer.from(String(i), 'ascii');
      this.push(`"${buf}"\n`);
    }
  }
}

export const uploadsTest: QueryTestCase = {
  id: 'Uploads',
  query: `
    query Uploads($datasetId: ID!) {
      uploads(datasetId: $datasetId) {
        id
        start
        finish
        datasetId
        errors {
          name
          message
          count
        }
        state
        addedEntries
        failedEntries
        invalidEntries
        fileNames
      }
    }
  `,
  beforeTest: async reqContext => {
    const ds = await createDataset('DS1', reqContext);
    await addValueSchema(
      ds.id,
      {
        name: 'count',
        type: DataType.NUMBER,
        fallback: '42',
        required: true,
        unique: true
      },
      reqContext
    );
    await uploadEntriesCsv(
      [{ filename: 'test.csv', stream: new Counter() }],
      ds.id,
      reqContext
    );

    return { variables: { datasetId: ds.id } };
  },
  expected: {
    uploads: [
      {
        addedEntries: 75,
        datasetId: expect.any(String),
        errors: [],
        failedEntries: 0,
        fileNames: ['test.csv'],
        finish: expect.any(Number),
        id: expect.any(String),
        invalidEntries: 75,
        start: expect.any(Number),
        state: 'SUCCESSFUL'
      }
    ]
  }
};
