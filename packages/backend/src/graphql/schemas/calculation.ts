const CalculationProcessDef = `
  type CalculationProcess {
    id: ID!
    start: Date!
    finish: Date
    state: String!
  }
`;

export default () => [CalculationProcessDef];
