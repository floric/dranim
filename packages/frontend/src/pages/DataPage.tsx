import * as React from 'react';

import { GQLDataset } from '@masterthesis/shared';
import { Card, Col } from 'antd';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';

import { CardItem } from '../components/CardItem';
import { cardItemProps, CardsLayout } from '../components/CardsLayout';
import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { tryOperation } from '../utils/form';
import { CreateDataSetForm } from './forms/CreateDatasetForm';

const ALL_DATASETS = gql`
  {
    datasets {
      id
      name
      entriesCount
      description
      created
      valueschemas {
        name
      }
    }
  }
`;

const CREATE_DATASET = gql`
  mutation createDataset($name: String!) {
    createDataset(name: $name) {
      id
    }
  }
`;

const DELETE_DATASET = gql`
  mutation deleteDataset($id: String!) {
    deleteDataset(id: $id)
  }
`;

export default class DataPage extends React.Component<{}, {}> {
  public render() {
    return (
      <>
        <PageHeaderCard
          title="Datasets"
          helpContent={
            <>
              <p>
                Structured data is represented in <strong>Datasets</strong>.
              </p>
              <p>
                Datasets are comparable to Tables in SQL and can contain{' '}
                <strong>Entries</strong> with their structure defined using{' '}
                <strong>Valueschemas</strong>.
              </p>
            </>
          }
        />
        <Query query={ALL_DATASETS}>
          {({ loading, error, data, refetch }) => {
            if (loading) {
              return <LoadingCard />;
            }

            if (error) {
              return <UnknownErrorCard error={error} />;
            }

            const datasets: Array<GQLDataset> = data.datasets;

            return (
              <CardsLayout>
                {datasets.map(ds => (
                  <Col {...cardItemProps} key={ds.id}>
                    <Mutation mutation={DELETE_DATASET}>
                      {deleteDataset => (
                        <CardItem
                          description={ds.description}
                          id={ds.id}
                          name={ds.name}
                          path="/data"
                          confirmDeleteMessage="Delete Dataset?"
                          handleDelete={() =>
                            tryOperation({
                              op: () =>
                                deleteDataset({
                                  variables: {
                                    id: ds.id
                                  }
                                }),
                              refetch,
                              successTitle: () => 'Dataset deleted',
                              successMessage: () =>
                                `Dataset "${ds.name}" deleted successfully.`,
                              failedTitle: 'Dataset not deleted.',
                              failedMessage: `Dataset "${
                                ds.name
                              }" deletion failed.`
                            })
                          }
                        >
                          <Col xs={{ span: 24 }} md={{ span: 12 }}>
                            {`${ds.valueschemas.length} Schemas`}
                          </Col>
                          <Col xs={{ span: 24 }} md={{ span: 12 }}>
                            {`${ds.entriesCount} Entries`}
                          </Col>
                        </CardItem>
                      )}
                    </Mutation>
                  </Col>
                ))}
                <Col
                  xs={{ span: 24 }}
                  md={{ span: 12 }}
                  xl={{ span: 8 }}
                  style={{ marginBottom: 12 }}
                >
                  <Card bordered={false}>
                    <h2>New Dataset</h2>
                    <Mutation mutation={CREATE_DATASET}>
                      {createDataset => (
                        <CreateDataSetForm
                          handleCreateDataset={name =>
                            tryOperation({
                              op: async () => {
                                await createDataset({ variables: { name } });
                                return true;
                              },
                              refetch,
                              successTitle: () => 'Dataset created',
                              successMessage: () =>
                                `Dataset "${name}" created successfully.`,
                              failedTitle: 'Dataset not created.',
                              failedMessage: `Dataset  "${name}" creation failed.`
                            })
                          }
                        />
                      )}
                    </Mutation>
                  </Card>
                </Col>
              </CardsLayout>
            );
          }}
        </Query>
      </>
    );
  }
}
