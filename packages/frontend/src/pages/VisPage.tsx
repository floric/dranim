import * as React from 'react';

import { GQLDashboard } from '@masterthesis/shared';
import { Card, Col } from 'antd';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';

import { CardItem } from '../components/CardItem';
import { cardItemProps, CardsLayout } from '../components/CardsLayout';
import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { tryOperation } from '../utils/form';
import { CreateDashboardForm } from './forms/CreateDashboardForm';

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
          if (loading) {
            return (
              <>
                <PageHeaderCard title="Dashboards" />
                <LoadingCard />
              </>
            );
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          const dashboards: Array<GQLDashboard> = data.dashboards;

          return (
            <>
              <PageHeaderCard
                title="Dashboards"
                helpContent={
                  <>
                    <p>
                      Visualizations are organized in{' '}
                      <strong>Dashboards</strong>.
                    </p>
                    <p>
                      Dashboards are used to display information retrieved from
                      the Datasets. They can contain any data from output nodes
                      except Dataset outputs.
                    </p>
                  </>
                }
              />
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
                    <h2>New Dashboard</h2>
                    <Mutation mutation={CREATE_DASHBOARD}>
                      {createDashboard => (
                        <CreateDashboardForm
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
