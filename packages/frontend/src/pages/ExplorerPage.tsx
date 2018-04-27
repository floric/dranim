import * as React from 'react';
import { Query } from 'react-apollo';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { ExplorerEditor } from './components/ExplorerEditor';
import { ALL_DATASETS } from '../App';
import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';

class ExplorerPage extends React.Component<{}> {
  public render() {
    return (
      <Query query={ALL_DATASETS}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          return <ExplorerEditor datasets={data.datasets} />;
        }}
      </Query>
    );
  }
}

export default withPageHeaderHoC({ title: 'Explorer', includeInCard: false })(
  ExplorerPage
);
