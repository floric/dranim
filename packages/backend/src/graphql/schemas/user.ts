const UserDef = `
  type User {
    firstName: String!
    lastName: String!
    mail: String!
    lastLogin: Date
    id: ID!
  }
`;

export default () => [UserDef];
