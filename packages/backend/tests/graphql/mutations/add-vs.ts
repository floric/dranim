import { DataType } from '../../../../shared/lib';
import { createDataset } from '../../../src/main/workspace/dataset';
import { MutationTestCase } from '../../test-utils';

export const addValueSchemaTest: MutationTestCase = {
  id: 'Add Valueschema',
  mutation: {
    query: `
      mutation addValueSchema($datasetId: ID!
          $name: String!
          $type: String!
          $required: Boolean!
          $fallback: String!
          $unique: Boolean!) {
        addValueSchema(datasetId: $datasetId,
          name: $name,
          type: $type,
          required: $required,
          fallback: $fallback,
          unique: $unique)
      }
    `,
    expected: {
      addValueSchema: true
    }
  },
  query: {
    query: `
      query {
        datasets {
          id
          valueschemas {
            name
            type
            required
            fallback
            unique
          }
        }
      }
  `,
    expected: {
      datasets: [
        {
          id: expect.any(String),
          valueschemas: [
            {
              fallback: '',
              name: 'ABC',
              required: true,
              type: 'String',
              unique: true
            }
          ]
        }
      ]
    }
  },
  beforeTest: async reqContext => {
    const ds = await createDataset('ABC', reqContext);
    return {
      variables: {
        datasetId: ds.id,
        name: 'ABC',
        type: DataType.STRING,
        required: true,
        unique: true,
        fallback: ''
      }
    };
  }
};
