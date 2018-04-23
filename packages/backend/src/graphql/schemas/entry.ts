import Dataset from './dataset';

const Entry = `
  type Entry {
    id: String!
    dataset: Dataset!
    values: String!
  }
`;

export default () => [Entry, Dataset];
