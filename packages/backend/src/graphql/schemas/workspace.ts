const FormValueDef = `
  type FormValue {
    name: String!
    value: String!
  }
`;

const SocketValueDef = `
  type SocketValue {
    name: String!
    connectionId: ID!
  }
`;

const NodeDef = `
  type Node {
    id: ID!
    type: String!
    x: Float!
    y: Float!
    inputs: [SocketValue!]!
    outputs: [SocketValue!]!
    contextIds: [String!]!
    state: String!
    form: FormValues!
    workspace: Workspace!
    metaInputs: Object!
    metaOutputs: Object!
    hasContextFn: Boolean!
    progress: Float
    inputSockets: Object
    outputSockets: Object
  }
`;

const NodeInputDef = `
  input NodeInput {
    id: ID!
    type: String!
    x: Float!
    y: Float!
  }
`;

const SocketDef = `
  type Socket {
    nodeId: ID!
    name: String!
  }
`;

const SocketInputDef = `
  input SocketInput {
    nodeId: ID!
    name: String!
  }
`;

const ConnectionDef = `
  type Connection {
    id: ID!
    from: Socket
    to: Socket
    contextIds: [String!]!
  }
`;

const ConnectionInputDef = `
  input ConnectionInput {
    from: SocketInput
    to: SocketInput
  }
`;

const OutputResultDef = `
  type OutputResult {
    id: ID!
    value: Object!
    type: String!
    name: String!
    description: String!
    visible: Boolean!
    workspaceId: String!
  }
`;

const WorkspaceDef = `
  type Workspace {
    id: ID!
    name: String!
    lastChange: Date!
    created: Date!
    description: String!
    nodes: [Node!]!
    connections: [Connection!]!
    results: [OutputResult!]!
    state: String!
    calculations: [CalculationProcess!]!
  }
`;

const PublicResultsDef = `
  type PublicResults {
    id: ID!
    name: String!
    lastChange: Date!
    created: Date!
    description: String!
    results: [OutputResult!]!
    userId: String!
  }
`;

const FormValuesDef = `
  scalar FormValues
`;

const DateDef = `scalar Date`;

export default () => [
  DateDef,
  OutputResultDef,
  FormValuesDef,
  FormValueDef,
  SocketValueDef,
  NodeDef,
  NodeInputDef,
  SocketDef,
  SocketInputDef,
  ConnectionDef,
  ConnectionInputDef,
  WorkspaceDef,
  PublicResultsDef
];
