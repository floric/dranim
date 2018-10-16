import React, { Component, SFC } from 'react';

import { GQLDataset } from '@masterthesis/shared';
import { Button, Divider, Steps } from 'antd';
import gql from 'graphql-tag';
import { History } from 'history';
import { Mutation } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';

import { HandledQuery } from '../../components/HandledQuery';
import { CustomErrorCard } from '../../components/layout/CustomCards';
import { PageHeaderCard } from '../../components/layout/PageHeaderCard';
import { EditableText } from '../../components/properties/EditableText';
import { RoutedTabs } from '../../components/RoutedTabs';
import { tryMutation } from '../../utils/form';
import DataActionsPage from './ActionsPage';
import DataEntriesPage from './EntriesPage';
import DataSchemas from './SchemasPage';

export interface DataDetailPageProps
  extends RouteComponentProps<{ id: string }, {}> {}

const NoDatasetExceptionActions: SFC<{ history: History }> = ({ history }) => (
  <Button
    type="primary"
    icon="plus-square"
    onClick={() => history.push('/data')}
  >
    Create Dataset
  </Button>
);

const DATASET = gql`
  query dataset($id: ID!) {
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
  mutation renameDataset($id: ID!, $name: String!) {
    renameDataset(id: $id, name: $name)
  }
`;

const getCurrentStep = (dataset: GQLDataset) =>
  dataset.valueschemas.length === 0 ? 1 : dataset.entriesCount === 0 ? 2 : 3;

export default class DataDetailPage extends Component<DataDetailPageProps> {
  public render() {
    const {
      history,
      match,
      location,
      match: {
        params: { id }
      }
    } = this.props;

    return (
      <HandledQuery<{ dataset: GQLDataset | null }, { id: string }>
        query={DATASET}
        variables={{ id }}
      >
        {({ data: { dataset } }) => {
          if (!dataset) {
            return (
              <CustomErrorCard
                title="Unknown Table"
                description={`The Table doesn't exist or you are missing the permissions to view it.`}
                actions={<NoDatasetExceptionActions history={history} />}
              />
            );
          }

          const step = getCurrentStep(dataset);
          const valueschemasCount = dataset.valueschemas.length;
          const { entriesCount, name } = dataset;

          return (
            <>
              <Mutation mutation={RENAME_DATASET}>
                {renameDataset => (
                  <PageHeaderCard
                    title={
                      <EditableText
                        text={name}
                        onChange={newName =>
                          tryMutation({
                            op: () =>
                              renameDataset({
                                variables: { id, name: newName },
                                refetchQueries: [
                                  { query: DATASET, variables: { id } }
                                ],
                                awaitRefetchQueries: true
                              }),
                            successTitle: () => 'Name updated',
                            successMessage: () => `Name updated successfully.`,
                            failedTitle: 'Name update failed',
                            failedMessage: `Name not updated.`
                          })
                        }
                      />
                    }
                    typeTitle="Table"
                    helpContent={
                      <>
                        <p>
                          A <strong>Table</strong> is defined with a{' '}
                          <strong>Schema</strong>. Each Schema consists of
                          several <strong>Fields</strong> which represent each
                          column of a Table.
                        </p>
                        <p>
                          <strong>Entries</strong> need to fit to the defined
                          Schema. Entries can be manually defined in the Entries
                          tab or uploaded. Currently only CSV files are
                          supported. But more import types could be supported in
                          the future.
                        </p>
                      </>
                    }
                    endContent={
                      step !== 3 ? (
                        <>
                          <Divider
                            style={{ marginTop: '1rem', marginBottom: '1rem' }}
                          />
                          <Steps current={step} size="small">
                            <Steps.Step title="Table created" />
                            <Steps.Step
                              title={
                                step < 2 ? 'Specify Fields' : 'Fields specified'
                              }
                            />
                            <Steps.Step title="Create or upload entries" />
                          </Steps>
                        </>
                      ) : null
                    }
                  />
                )}
              </Mutation>
              <RoutedTabs
                match={match}
                history={history}
                location={location}
                panes={[
                  {
                    name: `${valueschemasCount} Fields`,
                    key: 'schemas',
                    content: <DataSchemas dataset={dataset} />
                  },
                  {
                    name: `${entriesCount} Entries`,
                    key: 'entries',
                    disabled: valueschemasCount === 0,
                    content: <DataEntriesPage dataset={dataset} />
                  },
                  {
                    name: 'Import / Export',
                    key: 'actions',
                    disabled: valueschemasCount === 0,
                    content: <DataActionsPage dataset={dataset} />
                  }
                ]}
                defaultKey="schemas"
              />
            </>
          );
        }}
      </HandledQuery>
    );
  }
}
