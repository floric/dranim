const CalculationProcessDef = `
  type CalculationProcess {
    id: String!
    start: Date!
    finish: Date
    state: String!
    processedOutputs: Int!
    totalOutputs: Int!
  }
`;

export default () => [CalculationProcessDef];
