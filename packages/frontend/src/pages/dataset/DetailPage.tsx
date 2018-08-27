import * as React from 'react';

import { GQLDataset } from '@masterthesis/shared';
import { Button, Divider, Steps, Tabs } from 'antd';
import gql from 'graphql-tag';
import { History } from 'history';
import { Component, SFC } from 'react';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';

import {
  CustomErrorCard,
  LoadingCard,
  UnknownErrorCard
} from '../../components/CustomCards';
import { PageHeaderCard } from '../../components/PageHeaderCard';
import { DataActionsPage } from './ActionsPage';
import { DataEntriesPage } from './EntriesPage';
import { DataSchemas } from './SchemasPage';

export interface DataDetailPageProps
  extends RouteComponentProps<{ id: string }, {}> {}

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
        values
      }
    }
  }
`;

export default class DataDetailPage extends Component<DataDetailPageProps> {
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

          const dataset: GQLDataset = data.dataset;
          const currentStep =
            dataset.valueschemas.length === 0
              ? 1
              : dataset.entriesCount === 0
                ? 2
                : 3;

          return (
            <>
              <PageHeaderCard
                title={dataset.name}
                typeTitle="Dataset"
                helpContent={
                  <>
                    <p>
                      A <strong>Dataset</strong> is defined using{' '}
                      <strong>Valueschemas</strong>. Each Valueschema represents
                      one column of values.
                    </p>
                    <p>
                      <strong>Entries</strong> need to fit to the defined
                      Valueschema. They can be manually defined in the Entries
                      tab or uploaded. Currently only CSV files are supported.
                      But more import types could be supported in the future.
                    </p>
                  </>
                }
                endContent={
                  currentStep !== 3 ? (
                    <>
                      <Divider />
                      <Steps current={currentStep} size="small">
                        <Steps.Step title="Dataset created" />
                        <Steps.Step title="Schemas specified" />
                        <Steps.Step title="Entries created or uploaded" />
                      </Steps>
                    </>
                  ) : null
                }
              />
              <Tabs
                type="card"
                animated={{ inkBar: true, tabPane: false }}
                tabBarStyle={{ marginBottom: 0 }}
              >
                <Tabs.TabPane
                  tab={`${dataset.valueschemas.length} Schemas`}
                  key="schemas"
                >
                  <DataSchemas dataset={dataset} refetch={refetch} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={`${dataset.entriesCount} Entries`}
                  key="entries"
                >
                  <DataEntriesPage dataset={dataset} refetch={refetch} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Import / Export" key="actions">
                  <DataActionsPage dataset={dataset} refetch={refetch} />
                </Tabs.TabPane>
              </Tabs>
            </>
          );
        }}
      </Query>
    );
  }
}
