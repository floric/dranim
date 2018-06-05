export const MutationDef = `
  type Mutation {
    createDataset (
      name: String!
    ): Dataset!
    deleteDataset (
      id: String!
    ): Boolean!
    addValueSchema (
      datasetId: String!
      name: String!
      type: String!
      required: Boolean!
      fallback: String!
      unique: Boolean!
    ): Boolean!
    addEntry (
      datasetId: String!
      values: String!
    ): Entry!
    deleteEntry (
      datasetId: String!
      entryId: String!
    ): Boolean!
    createConnection (
      input: ConnectionInput!
    ): Connection!
    createNode (
      type: String!
      workspaceId: String!
      contextIds: [String!]!
      x: Float!
      y: Float!
    ): Node!
    deleteConnection (
      id: String!
    ): Boolean!
    deleteNode (
      id: String!
    ): Boolean!
    updateNode (
      id: String!
      x: Float!
      y: Float!
    ): Boolean!
    addOrUpdateFormValue (
      nodeId: String!
      name: String!
      value: String!
    ): Boolean!
    createWorkspace (
      name: String!
      description: String
    ): Workspace!
    deleteWorkspace (
      id: String!
    ): Boolean!
    updateWorkspace (
      id: String!
      nodes: [NodeInput!]!
      connections: [ConnectionInput!]!
    ): Boolean!
    createSTRDemoData: Boolean!
    createBirthdaysDemoData: Boolean!
    uploadEntriesCsv (files: [Upload!]!, datasetId: String!): UploadProcess!
    startCalculation (workspaceId: String!): CalculationProcess!
  }
`;
