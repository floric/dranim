const CalculationProcess = `
  type CalculationProcess {
    id: String!
    start: String!
    finish: String
    state: String!
  }
`;

export default () => [CalculationProcess];
