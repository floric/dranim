const Upload = `scalar Upload`;

const UploadError = `
  type UploadError {
    name: String!
    message: String!
    count: Int!
  }
`;

const UploadProcess = `
  type UploadProcess {
    id: String!
    start: String!
    finish: String
    datasetId: String!
    errors: [UploadError!]!
    state: String!
    addedEntries: Int!
    failedEntries: Int!
    invalidEntries: Int!
    fileNames: [String!]!
  }
`;

export default () => [Upload, UploadError, UploadProcess];
