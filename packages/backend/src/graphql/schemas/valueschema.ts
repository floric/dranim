const Valueschema = `
  type Valueschema {
    name: String!
    type: String!
    required: Boolean!
    fallback: String!
    unique: Boolean!
  }
`;

export default () => [Valueschema];
