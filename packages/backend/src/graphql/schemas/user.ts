const UserDef = `
  type User {
    firstName: String!
    lastName: String!
    mail: String!
    id: ID!
  }
`;

export default () => [UserDef];
