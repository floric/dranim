const CalculationProcessDef = `
  type CalculationProcess {
    id: ID!
    start: Date!
    finish: Date
    state: String!
    processedOutputs: Int!
    totalOutputs: Int!
  }
`;

export default () => [CalculationProcessDef];
