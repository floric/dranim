import EntryDef from './entry';
import ValueschemaDef from './valueschema';

const DatasetDef = `
  type Dataset {
    id: ID!
    name: String!
    valueschemas: [Valueschema!]!
    entriesCount: Int!
    latestEntries: [Entry!]!
    created: Date!
    description: String!
  }
`;

export default () => [DatasetDef, ValueschemaDef, EntryDef];
