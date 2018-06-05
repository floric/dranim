const CalculationProcessDef = `
  type CalculationProcess {
    id: String!
    start: String!
    finish: String
    state: String!
    processedOutputs: Int!
    totalOutputs: Int!
  }
`;

export default () => [CalculationProcessDef];
