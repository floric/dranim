import Dataset from './dataset';

const Entry = `
  type Entry {
    id: String!
    values: String!
  }
`;

export default () => [Entry, Dataset];
