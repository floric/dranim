import * as React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { ExplorerEditor } from './explorer/ExplorerEditor';
import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';
import { deepCopyResponse, tryOperation } from '../utils/form';

const EDITOR_NODE_SELECTION = gql`
  {
    datasets {
      id
      name
      entriesCount
      valueschemas {
        name
      }
    }
    editor {
      nodes {
        id
        type
        x
        y
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
  mutation createNode($type: String!, $x: Float!, $y: Float!) {
    createNode(type: $type, x: $x, y: $y) {
      id
      x
      y
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
  mutation startCalculation {
    startCalculation {
      id
      start
      state
    }
  }
`;

class ExplorerPage extends React.Component<{}> {
  public render() {
    return (
      <Query query={EDITOR_NODE_SELECTION}>
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
                                            data.editor.connections
                                          )}
                                          nodes={deepCopyResponse(
                                            data.editor.nodes
                                          )}
                                          onNodeCreate={(type, x, y) =>
                                            tryOperation({
                                              op: () =>
                                                createNode({
                                                  variables: { type, x, y }
                                                }),
                                              refetch,
                                              successTitle: null,
                                              failedTitle: 'Node not created'
                                            })
                                          }
                                          onNodeDelete={id =>
                                            tryOperation({
                                              op: () =>
                                                deleteNode({
                                                  variables: { id }
                                                }),
                                              refetch,
                                              successTitle: null,
                                              failedTitle: 'Node not deleted'
                                            })
                                          }
                                          onNodeUpdate={(id, x, y) =>
                                            tryOperation({
                                              op: () =>
                                                updateNode({
                                                  variables: { id, x, y }
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
                                          onConnectionDelete={id =>
                                            tryOperation({
                                              op: () =>
                                                deleteConnection({
                                                  variables: { id }
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
                                              op: () => startCalculation(),
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

export default withPageHeaderHoC({
  title: 'Explorer',
  includeInCard: false,
  size: 'small'
})(ExplorerPage);
