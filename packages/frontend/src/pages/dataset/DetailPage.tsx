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
import { tryOperation } from '../../utils/form';
import { DataActionsPage } from './ActionsPage';
import { DataEntriesPage } from './EntriesPage';
import { DataSchemas } from './SchemasPage';

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

export const DATASET = gql`
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
                title="Unknown Dataset"
                description={`The Dataset with ID ${id} doesn't exist.`}
                actions={<NoDatasetExceptionActions history={history} />}
              />
            );
          }

          const step = getCurrentStep(dataset);

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
                              renameDataset({
                                variables: { id, name },
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
                      step !== 3 ? (
                        <>
                          <Divider
                            style={{ marginTop: '1rem', marginBottom: '1rem' }}
                          />
                          <Steps current={step} size="small">
                            <Steps.Step title="Dataset created" />
                            <Steps.Step
                              title={
                                step < 2
                                  ? 'Specify Schemas'
                                  : 'Schemas specified'
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
                    name: `${dataset.valueschemas.length} Schemas`,
                    key: 'schemas',
                    content: <DataSchemas dataset={dataset} />
                  },
                  {
                    name: `${dataset.entriesCount} Entries`,
                    key: 'entries',
                    content: <DataEntriesPage dataset={dataset} />
                  },
                  {
                    name: 'Import / Export',
                    key: 'actions',
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
