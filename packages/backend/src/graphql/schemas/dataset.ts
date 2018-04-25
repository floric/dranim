import Valueschema from './valueschema';
import Entry from './entry';

const Dataset = `
  type Dataset {
    id: String!
    name: String!
    valueschemas: [Valueschema!]!
    entriesCount: Int!
    latestEntries: [Entry!]!
  }
`;

export default () => [Dataset, Valueschema, Entry];
