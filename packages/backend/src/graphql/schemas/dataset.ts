import Entry from './entry';
import Valueschema from './valueschema';

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
