import * as React from 'react';

import { GQLVisualization } from '@masterthesis/shared';
import { Card, Col } from 'antd';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';

import { CardItem } from '../components/CardItem';
import { cardItemProps, CardsLayout } from '../components/CardsLayout';
import { LoadingCard } from '../components/CustomCards';
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

          const visualizations: Array<GQLVisualization> = data.visualizations;

          return (
            <>
              <PageHeaderCard title="Visualizations" />
              <CardsLayout>
                {visualizations.map(vs => (
                  <Col {...cardItemProps} key={vs.id}>
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
                        />
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
              </CardsLayout>
            </>
          );
        }}
      </Query>
    );
  }
}
