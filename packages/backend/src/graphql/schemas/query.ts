export const QueryDef = `
  type Query {
    datasets: [Dataset!]!
    workspace(id: ID!): Workspace
    workspaces: [Workspace!]!
    dataset(id: ID!): Dataset
    entry(datasetId: ID!, entryId: ID!): Entry
    uploads(datasetId: ID!): [UploadProcess!]!
    calculations(workspaceId: ID!): [CalculationProcess!]!
    user: User
    results(workspaceId: ID!): PublicResults
  }
`;
