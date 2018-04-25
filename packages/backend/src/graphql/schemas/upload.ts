const Upload = `scalar Upload`;

const UploadResult = `
  type UploadResult {
    validEntries: Int!
    invalidEntries: Int!
  }
`;

export default () => [Upload, UploadResult];
