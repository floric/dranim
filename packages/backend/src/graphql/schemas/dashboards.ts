const OutputResultDef = `
  type OutputResult {
    id: String!
    value: String!
    type: String!
    name: String!
    description: String!
  }
`;

const DashboardDef = `
  type Dashboard {
    id: String!
    name: String!
    results: [OutputResult!]!
  }
`;

export default () => [OutputResultDef, DashboardDef];
