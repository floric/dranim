import DatasetDef from './dataset';

const EntryDef = `
  type Entry {
    id: String!
    values: String!
  }
`;

export default () => [EntryDef, DatasetDef];
