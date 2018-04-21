export const typeDef = `
# Root Query
type Query {
  test: String
}
type Mutation {
  doTest: Int
}
`;

export const resolver = {
  Query: {
    test(root, args, ctx) {
      return 'test';
    }
  },
  Mutation: {
    doTest(root, args, ctx) {
      return 0;
    }
  }
};
