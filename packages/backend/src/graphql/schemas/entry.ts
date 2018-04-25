import Dataset from './dataset';

const Val = `
  type Val {
    name: String!
    val: String!
  }
`;

const Entry = `
  type Entry {
    id: String!
    values: [Val!]!
  }
`;

export default () => [Entry, Val, Dataset];
