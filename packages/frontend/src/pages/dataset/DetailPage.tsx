import { GQLDataset } from '@masterthesis/shared';
import { Button, Divider, Steps, Tabs } from 'antd';
import gql from 'graphql-tag';
import { History } from 'history';
import * as React from 'react';
import { Component, SFC } from 'react';
import { Mutation } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';

import { CustomErrorCard } from '../../components/CustomCards';
import { EditableText } from '../../components/EditableText';
import { HandledQuery } from '../../components/HandledQuery';
import { PageHeaderCard } from '../../components/PageHeaderCard';
import { tryOperation } from '../../utils/form';
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

const RENAME_DATASET = gql`
  mutation renameDataset($id: String!, $name: String!) {
    renameDataset(id: $id, name: $name)
  }
`;

const getCurrentStep = (dataset: GQLDataset) =>
  dataset.valueschemas.length === 0 ? 1 : dataset.entriesCount === 0 ? 2 : 3;

export default class DataDetailPage extends Component<DataDetailPageProps> {
  public render() {
    const {
      history,
      match: {
        params: { id }
      }
    } = this.props;

    return (
      <HandledQuery<{ dataset: GQLDataset | null }, { id: string }>
        query={DATASET}
        variables={{ id }}
      >
        {({ data: { dataset }, refetch }) => {
          if (!dataset) {
            return (
              <CustomErrorCard
                title="Unknown dataset"
                description="Dataset doesn't exist."
                actions={<NoDatasetExceptionActions history={history} />}
              />
            );
          }

          return (
            <>
              <Mutation mutation={RENAME_DATASET}>
                {renameDataset => (
                  <PageHeaderCard
                    title={
                      <EditableText
                        text={dataset.name}
                        onChange={name =>
                          tryOperation({
                            op: () =>
                              renameDataset({ variables: { id, name } }),
                            refetch,
                            successTitle: () => 'Name updated',
                            successMessage: () => `Name updated successfully.`,
                            failedTitle: 'Name update failed',
                            failedMessage: `Name not updated.`
                          })
                        }
                      />
                    }
                    typeTitle="Dataset"
                    helpContent={
                      <>
                        <p>
                          A <strong>Dataset</strong> is defined using{' '}
                          <strong>Valueschemas</strong>. Each Valueschema
                          represents one column of values.
                        </p>
                        <p>
                          <strong>Entries</strong> need to fit to the defined
                          Valueschema. They can be manually defined in the
                          Entries tab or uploaded. Currently only CSV files are
                          supported. But more import types could be supported in
                          the future.
                        </p>
                      </>
                    }
                    endContent={
                      getCurrentStep(dataset) !== 3 ? (
                        <>
                          <Divider
                            style={{ marginTop: '1rem', marginBottom: '1rem' }}
                          />
                          <Steps current={getCurrentStep(dataset)} size="small">
                            <Steps.Step title="Dataset created" />
                            <Steps.Step title="Schemas specified" />
                            <Steps.Step title="Entries created or uploaded" />
                          </Steps>
                        </>
                      ) : null
                    }
                  />
                )}
              </Mutation>
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
      </HandledQuery>
    );
  }
}
