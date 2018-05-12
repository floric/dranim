import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { ExplorerEditor } from './explorer/ExplorerEditor';
import { LoadingCard, UnknownErrorCard } from '../../components/CustomCards';
import { deepCopyResponse, tryOperation } from '../../utils/form';

const WORKSPACE_NODE_SELECTION = gql`
  query dataset($workspaceId: String!) {
    datasets {
      id
      name
      entriesCount
      valueschemas {
        name
      }
    }
    workspace(id: $workspaceId) {
      nodes {
        id
        type
        x
        y
        state
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
      }
    }
  }
`;

const CREATE_NODE = gql`
  mutation createNode(
    $type: String!
    $workspaceId: String!
    $x: Float!
    $y: Float!
  ) {
    createNode(type: $type, workspaceId: $workspaceId, x: $x, y: $y) {
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

const DELETE_NODE = gql`
  mutation deleteNode($id: String!) {
    deleteNode(id: $id)
  }
`;

const UPDATE_NODE = gql`
  mutation updateNode($id: String!, $x: Float!, $y: Float!) {
    updateNode(id: $id, x: $x, y: $y)
  }
`;

const CREATE_CONNECTION = gql`
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

const DELETE_CONNECTION = gql`
  mutation deleteConnection($id: String!) {
    deleteConnection(id: $id)
  }
`;

const ADD_OR_UPDATE_FORM_VALUE = gql`
  mutation addOrUpdateFormValue(
    $nodeId: String!
    $name: String!
    $value: String!
  ) {
    addOrUpdateFormValue(nodeId: $nodeId, name: $name, value: $value)
  }
`;

const START_CALCULATION = gql`
  mutation startCalculation($workspaceId: String!) {
    startCalculation(workspaceId: $workspaceId) {
      id
      start
      state
    }
  }
`;

export default class WorkspaceEditorPage extends React.Component<
  RouteComponentProps<{ id: string }>
> {
  public render() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    return (
      <Query query={WORKSPACE_NODE_SELECTION} variables={{ workspaceId: id }}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          return (
            <Mutation mutation={START_CALCULATION}>
              {startCalculation => (
                <Mutation mutation={ADD_OR_UPDATE_FORM_VALUE}>
                  {addOrUpdateFormValue => (
                    <Mutation mutation={DELETE_CONNECTION}>
                      {deleteConnection => (
                        <Mutation mutation={CREATE_CONNECTION}>
                          {createConnection => (
                            <Mutation mutation={DELETE_NODE}>
                              {deleteNode => (
                                <Mutation mutation={CREATE_NODE}>
                                  {createNode => (
                                    <Mutation mutation={UPDATE_NODE}>
                                      {updateNode => (
                                        <ExplorerEditor
                                          datasets={data.datasets}
                                          connections={deepCopyResponse(
                                            data.workspace.connections
                                          )}
                                          nodes={deepCopyResponse(
                                            data.workspace.nodes
                                          )}
                                          onNodeCreate={(type, x, y) =>
                                            tryOperation({
                                              op: () =>
                                                createNode({
                                                  variables: {
                                                    type,
                                                    x,
                                                    y,
                                                    workspaceId: id
                                                  }
                                                }),
                                              refetch,
                                              successTitle: null,
                                              failedTitle: 'Node not created'
                                            })
                                          }
                                          onNodeDelete={nodeId =>
                                            tryOperation({
                                              op: () =>
                                                deleteNode({
                                                  variables: { id: nodeId }
                                                }),
                                              refetch,
                                              successTitle: null,
                                              failedTitle: 'Node not deleted'
                                            })
                                          }
                                          onNodeUpdate={(nodeId, x, y) =>
                                            tryOperation({
                                              op: () =>
                                                updateNode({
                                                  variables: {
                                                    id: nodeId,
                                                    x,
                                                    y
                                                  }
                                                }),
                                              refetch,
                                              successTitle: null,
                                              failedTitle: 'Node not updated'
                                            })
                                          }
                                          onConnectionCreate={(from, to) =>
                                            tryOperation({
                                              op: () =>
                                                createConnection({
                                                  variables: {
                                                    input: { from, to }
                                                  }
                                                }),
                                              refetch,
                                              successTitle: null,
                                              failedTitle:
                                                'Connection not created'
                                            })
                                          }
                                          onConnectionDelete={connId =>
                                            tryOperation({
                                              op: () =>
                                                deleteConnection({
                                                  variables: { id: connId }
                                                }),
                                              refetch,
                                              successTitle: null,
                                              failedTitle:
                                                'Connection not deleted'
                                            })
                                          }
                                          onAddOrUpdateFormValue={(
                                            nodeId,
                                            name,
                                            value
                                          ) =>
                                            tryOperation({
                                              op: () =>
                                                addOrUpdateFormValue({
                                                  variables: {
                                                    nodeId,
                                                    name,
                                                    value
                                                  }
                                                }),
                                              refetch,
                                              successTitle: null,
                                              failedTitle: 'Value not changed'
                                            })
                                          }
                                          onStartCalculation={() =>
                                            tryOperation({
                                              op: () =>
                                                startCalculation({
                                                  variables: { workspaceId: id }
                                                }),
                                              refetch,
                                              successTitle: () =>
                                                'Process started',
                                              successMessage: () =>
                                                'This might take several minutes',
                                              failedTitle:
                                                'Process start has failed'
                                            })
                                          }
                                        />
                                      )}
                                    </Mutation>
                                  )}
                                </Mutation>
                              )}
                            </Mutation>
                          )}
                        </Mutation>
                      )}
                    </Mutation>
                  )}
                </Mutation>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}
