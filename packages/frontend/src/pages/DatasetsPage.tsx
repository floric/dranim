import React, { SFC } from 'react';

import { GQLDataset } from '@masterthesis/shared';
import { Card, Col, Row } from 'antd';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { HandledQuery } from '../components/HandledQuery';
import { TimeInfo } from '../components/infos/TimeInfo';
import { CardItem } from '../components/layout/CardItem';
import { cardItemProps, CardsLayout } from '../components/layout/CardsLayout';
import { PageHeaderCard } from '../components/layout/PageHeaderCard';
import { compareByName } from '../utils/data';
import { tryMutation } from '../utils/form';
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
  mutation deleteDataset($id: ID!) {
    deleteDataset(id: $id)
  }
`;

const DatasetsPage: SFC = () => (
  <>
    <PageHeaderCard
      title="Tables"
      helpContent={
        <>
          <p>
            Structured data is represented in <strong>Tables</strong>.
          </p>
          <p>
            They are comparable to Tables in relational Databases and can
            contain <strong>Entries</strong> with their structure defined using{' '}
            <strong>Fields</strong> in a <strong>Schema</strong>.
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
                      confirmDeleteMessage="Delete Table?"
                      handleDelete={() =>
                        tryMutation({
                          op: () =>
                            deleteDataset({
                              variables: {
                                id: ds.id
                              },
                              awaitRefetchQueries: true,
                              refetchQueries: [{ query: ALL_DATASETS }]
                            }),
                          successTitle: () => 'Table deleted',
                          successMessage: () =>
                            `Table "${ds.name}" deleted successfully.`,
                          failedTitle: 'Table not deleted.',
                          failedMessage: `Table "${ds.name}" deletion failed.`
                        })
                      }
                    >
                      <Row
                        type="flex"
                        justify="space-between"
                        gutter={8}
                        style={{ marginBottom: 8 }}
                      >
                        <Col>
                          <strong>{ds.valueschemas.length}</strong> Fields
                        </Col>
                        <Col>
                          <strong>{ds.entriesCount}</strong> Entries
                        </Col>
                      </Row>
                      <TimeInfo text="Created" time={ds.created} />
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
              <h2>New Table</h2>
              <Mutation<boolean> mutation={CREATE_DATASET}>
                {createDataset => (
                  <CreateDataSetForm
                    handleCreateDataset={name =>
                      tryMutation({
                        op: () =>
                          createDataset({
                            variables: { name },
                            awaitRefetchQueries: true,
                            refetchQueries: [{ query: ALL_DATASETS }]
                          }),
                        fallback: false,
                        successTitle: () => 'Table created',
                        successMessage: () =>
                          `Table "${name}" created successfully.`,
                        failedTitle: 'Table not created.',
                        failedMessage: `Table "${name}" creation failed.`
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
