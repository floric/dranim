const UserDef = `
  type User {
    firstName: String!
    lastName: String!
    mail: String!
    lastLogin: String
    id: String!
  }
`;

export default () => [UserDef];
