import * as React from 'react';

import { Card, Col, Row } from 'antd';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';

import { CardItem } from '../components/CardItem';
import { LoadingCard } from '../components/CustomCards';
import { NumberInfo } from '../components/NumberInfo';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { tryOperation } from '../utils/form';
import { CreateVisForm } from './forms/CreateVisForm';

const CREATE_VIS = gql`
  mutation createVisualization($name: String!, $datasetId: String!) {
    createVisualization(name: $name, datasetId: $datasetId) {
      id
    }
  }
`;

export const DELETE_VIS = gql`
  mutation deleteVisualization($id: String!) {
    deleteVisualization(id: $id)
  }
`;

export const ALL_VIS = gql`
  {
    visualizations {
      id
      name
    }
  }
`;

export default class VisPage extends React.Component<{}, {}> {
  public render() {
    return (
      <Query query={ALL_VIS}>
        {({ loading, error, data, refetch }) => {
          if (loading || error) {
            return (
              <>
                <PageHeaderCard title="Visualizations" />
                <LoadingCard />
              </>
            );
          }

          return (
            <>
              <PageHeaderCard title="Visualizations" />
              <Row gutter={12} style={{ marginBottom: 12 }}>
                {data.visualizations.map(vs => (
                  <Col
                    key={`card-${vs.id}`}
                    sm={{ span: 24 }}
                    md={{ span: 12 }}
                    xl={{ span: 6 }}
                    style={{ marginBottom: 12 }}
                  >
                    <Mutation mutation={DELETE_VIS}>
                      {deleteVis => (
                        <CardItem
                          confirmDeleteMessage="Delete Visualization?"
                          id={vs.id}
                          name={vs.name}
                          path="/visualizations"
                          handleDelete={async () => {
                            await tryOperation({
                              op: () =>
                                deleteVis({
                                  variables: {
                                    id: vs.id
                                  }
                                }),
                              refetch,
                              successTitle: () => 'Visualization deleted',
                              successMessage: () =>
                                `Visualization "${
                                  vs.name
                                }" deleted successfully.`,
                              failedTitle: 'Visualization not deleted.',
                              failedMessage: `Visualization "${
                                vs.name
                              }" deletion failed.`
                            });
                          }}
                        >
                          <Col xs={{ span: 24 }} md={{ span: 12 }}>
                            <NumberInfo total={0} title="Entries" />
                          </Col>
                        </CardItem>
                      )}
                    </Mutation>
                  </Col>
                ))}
                <Col
                  xs={{ span: 24 }}
                  md={{ span: 12 }}
                  style={{ marginBottom: 12 }}
                >
                  <Card bordered={false}>
                    <Mutation mutation={CREATE_VIS}>
                      {createVis => (
                        <CreateVisForm
                          handleCreate={(name, datasetId) =>
                            tryOperation({
                              op: async () => {
                                await createVis({
                                  variables: { name, datasetId }
                                });
                                return true;
                              },
                              refetch,
                              successTitle: () => 'Visualization created',
                              successMessage: () =>
                                `Visualization "${name}" created successfully.`,
                              failedTitle: 'Visualization not created.',
                              failedMessage: `Visualization  "${name}" creation failed.`
                            })
                          }
                        />
                      )}
                    </Mutation>
                  </Card>
                </Col>
              </Row>
            </>
          );
        }}
      </Query>
    );
  }
}
