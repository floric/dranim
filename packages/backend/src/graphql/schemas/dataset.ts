import Valueschema from './valueschema';
import Entry from './entry';

const Dataset = `
  type Dataset {
    _id: String!
    name: String!
    valueschemas: [Valueschema!]!
    entries: [Entry!]!
  }
`;

export default () => [Dataset, Valueschema, Entry];
