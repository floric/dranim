const Valueschema = `
  type Valueschema {
    name: String!
    type: String!
    required: Boolean!
    default: String!
  }
`;

export default () => [Valueschema];
