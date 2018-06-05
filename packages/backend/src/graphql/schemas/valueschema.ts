const ValueschemaDef = `
  type Valueschema {
    name: String!
    type: String!
    required: Boolean!
    fallback: String!
    unique: Boolean!
  }
`;

export default () => [ValueschemaDef];
