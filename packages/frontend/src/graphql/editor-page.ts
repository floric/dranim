import gql from 'graphql-tag';

export const DASETS_AND_WORKSPACES = gql`
  query workspace($workspaceId: ID!) {
    datasets {
      id
      name
      entriesCount
      valueschemas {
        name
        unique
        type
      }
    }
    workspace(id: $workspaceId) {
      id
      name
      state
      nodes {
        id
        type
        x
        y
        state
        contextIds
        inputs {
          name
          connectionId
        }
        outputs {
          name
          connectionId
        }
        form {
          name
          value
        }
        metaInputs
        hasContextFn
        progress
        inputSockets
        outputSockets
      }
      connections {
        id
        from {
          nodeId
          name
        }
        to {
          nodeId
          name
        }
        contextIds
      }
    }
  }
`;

export const CALCULATIONS = gql`
  query workspace($workspaceId: ID!) {
    calculations(workspaceId: $workspaceId) {
      id
      start
      state
      processedOutputs
      totalOutputs
    }
  }
`;

export const CREATE_NODE = gql`
  mutation createNode(
    $type: String!
    $workspaceId: ID!
    $contextIds: [String!]!
    $x: Float!
    $y: Float!
  ) {
    createNode(
      type: $type
      workspaceId: $workspaceId
      contextIds: $contextIds
      x: $x
      y: $y
    ) {
      id
      x
      y
      workspace {
        id
      }
      type
    }
  }
`;

export const DELETE_NODE = gql`
  mutation deleteNode($id: ID!) {
    deleteNode(id: $id)
  }
`;

export const UPDATE_NODE = gql`
  mutation updateNodePosition($id: ID!, $x: Float!, $y: Float!) {
    updateNodePosition(id: $id, x: $x, y: $y)
  }
`;

export const CREATE_CONNECTION = gql`
  mutation createConnection($input: ConnectionInput!) {
    createConnection(input: $input) {
      id
      from {
        nodeId
        name
      }
      to {
        nodeId
        name
      }
    }
  }
`;

export const DELETE_CONNECTION = gql`
  mutation deleteConnection($id: ID!) {
    deleteConnection(id: $id)
  }
`;

export const ADD_OR_UPDATE_FORM_VALUE = gql`
  mutation addOrUpdateFormValue($nodeId: ID!, $name: String!, $value: String!) {
    addOrUpdateFormValue(nodeId: $nodeId, name: $name, value: $value)
  }
`;

export const START_CALCULATION = gql`
  mutation startCalculation($workspaceId: ID!) {
    startCalculation(workspaceId: $workspaceId) {
      id
      start
      state
    }
  }
`;

export const STOP_CALCULATION = gql`
  mutation stopCalculation($id: ID!) {
    stopCalculation(id: $id)
  }
`;
