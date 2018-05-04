import * as React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { ExplorerEditor } from './explorer/ExplorerEditor';
import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';
import { deepCopyResponse } from '../utils/form';

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
                                  nodes={deepCopyResponse(data.editor.nodes)}
                                  onNodeCreate={async (type, x, y) => {
                                    await createNode({
                                      variables: { type, x, y }
                                    });
                                    await refetch();
                                  }}
                                  onNodeDelete={async id => {
                                    await deleteNode({ variables: { id } });
                                    await refetch();
                                  }}
                                  onNodeUpdate={async (id, x, y) => {
                                    await updateNode({
                                      variables: { id, x, y }
                                    });
                                    await refetch();
                                  }}
                                  onConnectionCreate={async (from, to) => {
                                    await createConnection({
                                      variables: { input: { from, to } }
                                    });
                                    await refetch();
                                  }}
                                  onConnectionDelete={async id => {
                                    await deleteConnection({
                                      variables: { id }
                                    });
                                    await refetch();
                                  }}
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
