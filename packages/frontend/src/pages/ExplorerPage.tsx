import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import {
  ExplorerEditor,
  NodeDef,
  ConnectionDef
} from './explorer/ExplorerEditor';
import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';

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
    explorer @client {
      socketPositions {
        name
        x
        y
      }
    }
  }
`;

const nodes: Array<NodeDef> = [
  { id: '1', type: 'DatasetInputNode', x: 100, y: 95 },
  { id: '2', type: 'DatasetSelectValuesNode', x: 550, y: 105 },
  { id: '3', type: 'StringInputNode', x: 100, y: 255 },
  { id: '4', type: 'NumberInputNode', x: 50, y: 435 },
  { id: '5', type: 'StringLengthNode', x: 550, y: 435 }
];

const connections: Array<ConnectionDef> = [
  {
    from: { nodeId: '1', socketName: 'Dataset' },
    to: { nodeId: '2', socketName: 'Dataset' }
  }
];

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
            <ExplorerEditor
              datasets={data.datasets}
              connections={connections}
              nodes={nodes}
            />
          );
        }}
      </Query>
    );
  }
}

export default withPageHeaderHoC({ title: 'Explorer', includeInCard: false })(
  ExplorerPage
);
