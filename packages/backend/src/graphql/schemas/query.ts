export const QueryDef = `
  type Query {
    datasets: [Dataset!]!
    workspace(id: String!): Workspace
    workspaces: [Workspace!]!
    dataset(id: String!): Dataset
    entry(datasetId: String!, entryId: String!): Entry
    uploads(datasetId: String): [UploadProcess!]!
    calculations(workspaceId: String!): [CalculationProcess!]!
    dashboards: [Dashboard!]!
    dashboard(id: String!): Dashboard
  }
`;
