const UserDef = `
  type User {
    firstName: String!
    lastName: String!
    mail: String!
    lastLogin: Date
    id: String!
  }
`;

export default () => [UserDef];
