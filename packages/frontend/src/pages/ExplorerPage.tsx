import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { ExplorerEditor } from './explorer/ExplorerEditor';
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
              connections={[]}
              nodes={[]}
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
