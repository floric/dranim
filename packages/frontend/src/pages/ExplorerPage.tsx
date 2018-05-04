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
                          onNodeUpdated={async (id, x, y) => {
                            await updateNode({ variables: { id, x, y } });
                            await refetch();
                          }}
                        />
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
