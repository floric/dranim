const FormValue = `
  type FormValue {
    name: String!
    value: String!
  }
`;

const SocketValue = `
  type SocketValue {
    name: String!
    connectionId: String!
  }
`;

const Node = `
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
  }
`;

const NodeInput = `
  input NodeInput {
    id: String!
    type: String!
    x: Float!
    y: Float!
  }
`;

const Socket = `
  type Socket {
    nodeId: String!
    name: String!
  }
`;

const SocketInput = `
  input SocketInput {
    nodeId: String!
    name: String!
  }
`;

const Connection = `
  type Connection {
    id: String!
    from: Socket
    to: Socket
    contextIds: [String!]!
    workspace: Workspace!
  }
`;

const ConnectionInput = `
  input ConnectionInput {
    from: SocketInput
    to: SocketInput
  }
`;

const Workspace = `
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

const Meta = `
  scalar Meta
`;

const SocketDefs = `
  scalar SocketDefs
`;

export default () => [
  Meta,
  SocketDefs,
  FormValue,
  SocketValue,
  Node,
  NodeInput,
  Socket,
  SocketInput,
  Connection,
  ConnectionInput,
  Workspace
];
