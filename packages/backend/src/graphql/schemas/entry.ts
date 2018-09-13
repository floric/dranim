import DatasetDef from './dataset';

const EntryDef = `
  type Entry {
    id: ID!
    values: String!
  }
`;

export default () => [EntryDef, DatasetDef];
