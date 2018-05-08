import * as React from 'react';
import { SFC, Component } from 'react';
import { Button, Tabs } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { History } from 'history';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import {
  LoadingCard,
  UnknownErrorCard,
  CustomErrorCard
} from '../components/CustomCards';
import { DataEntries } from './dataset-details/EntriesPage';
import { DataSchemas } from './dataset-details/SchemasPage';
import { DatasetActions } from './dataset-details/ActionsPage';
import { Dataset } from '../utils/model';

const TabPane = Tabs.TabPane;

export interface IDataDetailPageProps
  extends RouteComponentProps<{ id: string }> {}

const NoDatasetExceptionActions: SFC<{ history: History }> = ({ history }) => (
  <Button type="primary" onClick={() => history.push('/data')}>
    Create new Dataset
  </Button>
);

const DATASET = gql`
  query dataset($id: String!) {
    dataset(id: $id) {
      id
      name
      valueschemas {
        name
        type
        required
        fallback
        unique
      }
      entriesCount
      latestEntries {
        id
        values {
          name
          val
        }
      }
    }
  }
`;

class DataDetailPage extends Component<IDataDetailPageProps> {
  public render() {
    const {
      history,
      match: {
        params: { id }
      }
    } = this.props;

    return (
      <Query query={DATASET} variables={{ id }}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          if (!data.dataset) {
            return (
              <CustomErrorCard
                title="Unknown dataset"
                description="Dataset doesn't exist."
                actions={<NoDatasetExceptionActions history={history} />}
              />
            );
          }

          const dataset: Dataset = data.dataset;

          return (
            <Tabs
              type="card"
              animated={{ inkBar: true, tabPane: false }}
              tabBarStyle={{ marginBottom: 0 }}
            >
              <TabPane
                tab={`${dataset.valueschemas.length} Schemas`}
                key="schemas"
              >
                <DataSchemas dataset={dataset} refetch={refetch} />
              </TabPane>
              <TabPane tab={`${dataset.entriesCount} Entries`} key="entries">
                <DataEntries dataset={dataset} refetch={refetch} />
              </TabPane>
              <TabPane tab="Actions" key="actions">
                <DatasetActions dataset={dataset} refetch={refetch} />
              </TabPane>
            </Tabs>
          );
        }}
      </Query>
    );
  }
}

export default withPageHeaderHoC({
  title: 'Details',
  size: 'small',
  includeInCard: false
})(withRouter(DataDetailPage));
