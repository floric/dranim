const Valueschema = `
  type Valueschema {
    name: String!
    type: String!
    required: Boolean!
    fallback: String!
  }
`;

export default () => [Valueschema];
