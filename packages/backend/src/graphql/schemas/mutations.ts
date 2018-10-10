export const MutationDef = `
  type Mutation {
    createDataset (
      name: String!
    ): Dataset!
    deleteDataset (
      id: ID!
    ): Boolean!
    renameDataset (
      id: ID!
      name: String!
    ): Boolean!
    addValueSchema (
      datasetId: ID!
      name: String!
      type: String!
      required: Boolean!
      fallback: String!
      unique: Boolean!
    ): Boolean!
    addEntry (
      datasetId: ID!
      values: String!
    ): Entry!
    deleteEntry (
      datasetId: ID!
      entryId: ID!
    ): Boolean!
    createConnection (
      input: ConnectionInput!
    ): Connection!
    createNode (
      type: String!
      workspaceId: ID!
      contextIds: [String!]!
      x: Float!
      y: Float!
    ): Node!
    deleteConnection (
      id: ID!
    ): Boolean!
    deleteNode (
      id: ID!
    ): Boolean!
    updateNodePosition (
      id: ID!
      x: Float!
      y: Float!
    ): Boolean!
    addOrUpdateFormValue (
      nodeId: ID!
      name: String!
      value: String!
    ): Boolean!
    createWorkspace (
      name: String!
      description: String
    ): Workspace!
    deleteWorkspace (
      id: ID!
    ): Boolean!
    updateWorkspace (
      id: ID!
      nodes: [NodeInput!]!
      connections: [ConnectionInput!]!
    ): Boolean!
    renameWorkspace (
      id: ID!
      name: String!
    ): Boolean!
    setResultVisibility (
      id: ID!
      visible: Boolean!
    ): OutputResult!
    createDemoData(type: String!): Boolean!
    uploadEntriesCsv (files: [Upload!]!, datasetId: ID!): UploadProcess!
    startCalculation (workspaceId: ID!): CalculationProcess!
    stopCalculation (id: ID!): Boolean!
  }
`;
