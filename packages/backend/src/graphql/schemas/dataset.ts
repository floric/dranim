import EntryDef from './entry';
import ValueschemaDef from './valueschema';

const DatasetDef = `
  type Dataset {
    id: String!
    name: String!
    valueschemas: [Valueschema!]!
    entriesCount: Int!
    latestEntries: [Entry!]!
  }
`;

export default () => [DatasetDef, ValueschemaDef, EntryDef];
