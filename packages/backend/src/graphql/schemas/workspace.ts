const FormValueDef = `
  type FormValue {
    name: String!
    value: String!
  }
`;

const SocketValueDef = `
  type SocketValue {
    name: String!
    connectionId: String!
  }
`;

const NodeDef = `
  type Node {
    id: String!
    type: String!
    x: Float!
    y: Float!
    inputs: [SocketValue!]!
    outputs: [SocketValue!]!
    contextIds: [String!]!
    state: String!
    form: [FormValue!]!
    workspace: Workspace!
    metaInputs: Meta!
    metaOutputs: Meta!
    hasContextFn: Boolean!
    contextInputDefs: SocketDefs
    contextOutputDefs: SocketDefs
    progress: Float
  }
`;

const NodeInputDef = `
  input NodeInput {
    id: String!
    type: String!
    x: Float!
    y: Float!
  }
`;

const SocketDef = `
  type Socket {
    nodeId: String!
    name: String!
  }
`;

const SocketInputDef = `
  input SocketInput {
    nodeId: String!
    name: String!
  }
`;

const ConnectionDef = `
  type Connection {
    id: String!
    from: Socket
    to: Socket
    contextIds: [String!]!
    workspace: Workspace!
  }
`;

const ConnectionInputDef = `
  input ConnectionInput {
    from: SocketInput
    to: SocketInput
  }
`;

const WorkspaceDef = `
  type Workspace {
    id: String!
    name: String!
    lastChange: String!
    created: String!
    description: String!
    nodes: [Node!]!
    connections: [Connection!]!
  }
`;

const MetaDef = `
  scalar Meta
`;

const SocketDefsDef = `
  scalar SocketDefs
`;

export default () => [
  MetaDef,
  SocketDefsDef,
  FormValueDef,
  SocketValueDef,
  NodeDef,
  NodeInputDef,
  SocketDef,
  SocketInputDef,
  ConnectionDef,
  ConnectionInputDef,
  WorkspaceDef
];
