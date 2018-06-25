import * as React from 'react';

import { GQLDashboard } from '@masterthesis/shared';
import { Card, Col } from 'antd';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';

import { CardItem } from '../components/CardItem';
import { cardItemProps, CardsLayout } from '../components/CardsLayout';
import { LoadingCard } from '../components/CustomCards';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { tryOperation } from '../utils/form';
import { CreateVisForm } from './forms/CreateVisForm';

const CREATE_DASHBOARD = gql`
  mutation createDashboard($name: String!) {
    createDashboard(name: $name) {
      id
    }
  }
`;

export const DELETE_DASHBOARD = gql`
  mutation deleteDashboard($id: String!) {
    deleteDashboard(id: $id)
  }
`;

export const ALL_DASHBOARDS = gql`
  {
    dashboards {
      id
      name
    }
  }
`;

export default class VisPage extends React.Component<{}, {}> {
  public render() {
    return (
      <Query query={ALL_DASHBOARDS}>
        {({ loading, error, data, refetch }) => {
          if (loading || error) {
            return (
              <>
                <PageHeaderCard title="Dashboards" />
                <LoadingCard />
              </>
            );
          }

          const dashboards: Array<GQLDashboard> = data.dashboards;

          return (
            <>
              <PageHeaderCard title="Dashboards" />
              <CardsLayout>
                {dashboards.map(vs => (
                  <Col {...cardItemProps} key={vs.id}>
                    <Mutation mutation={DELETE_DASHBOARD}>
                      {deleteDashboard => (
                        <CardItem
                          confirmDeleteMessage="Delete Dashboard?"
                          id={vs.id}
                          name={vs.name}
                          path="/dashboards"
                          handleDelete={async () => {
                            await tryOperation({
                              op: () =>
                                deleteDashboard({
                                  variables: {
                                    id: vs.id
                                  }
                                }),
                              refetch,
                              successTitle: () => 'Dashboard deleted',
                              successMessage: () =>
                                `Dashboard "${vs.name}" deleted successfully.`,
                              failedTitle: 'Dashboard not deleted.',
                              failedMessage: `Dashboard "${
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
                    <Mutation mutation={CREATE_DASHBOARD}>
                      {createDashboard => (
                        <CreateVisForm
                          handleCreate={name =>
                            tryOperation({
                              op: async () => {
                                await createDashboard({
                                  variables: { name }
                                });
                                return true;
                              },
                              refetch,
                              successTitle: () => 'Dashboard created',
                              successMessage: () =>
                                `Dashboard "${name}" created successfully.`,
                              failedTitle: 'Dashboard not created.',
                              failedMessage: `Dashboard  "${name}" creation failed.`
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
