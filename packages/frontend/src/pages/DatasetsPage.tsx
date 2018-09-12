import React, { SFC } from 'react';

import { GQLDataset } from '@masterthesis/shared';
import { Card, Col } from 'antd';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { HandledQuery } from '../components/HandledQuery';
import { CardItem } from '../components/layout/CardItem';
import { cardItemProps, CardsLayout } from '../components/layout/CardsLayout';
import { PageHeaderCard } from '../components/layout/PageHeaderCard';
import { compareByName } from '../utils/data';
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

const DatasetsPage: SFC = () => (
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
    <HandledQuery<{ datasets: Array<GQLDataset> }> query={ALL_DATASETS}>
      {({ data: { datasets } }) => (
        <CardsLayout>
          {Array.from(datasets)
            .sort(compareByName)
            .map(ds => (
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
                              },
                              awaitRefetchQueries: true,
                              refetchQueries: [{ query: ALL_DATASETS }]
                            }),
                          successTitle: () => 'Dataset deleted',
                          successMessage: () =>
                            `Dataset "${ds.name}" deleted successfully.`,
                          failedTitle: 'Dataset not deleted.',
                          failedMessage: `Dataset "${ds.name}" deletion failed.`
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
            style={{ marginBottom: '1rem' }}
          >
            <Card bordered={false}>
              <h2>New Dataset</h2>
              <Mutation mutation={CREATE_DATASET}>
                {createDataset => (
                  <CreateDataSetForm
                    handleCreateDataset={name =>
                      tryOperation<any>({
                        op: () =>
                          createDataset({
                            variables: { name },
                            awaitRefetchQueries: true,
                            refetchQueries: [{ query: ALL_DATASETS }]
                          }),
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
      )}
    </HandledQuery>
  </>
);

export default DatasetsPage;
