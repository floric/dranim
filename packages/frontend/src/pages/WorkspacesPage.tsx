import * as React from 'react';

import { Workspace } from '@masterthesis/shared';
import { Card, Col } from 'antd';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';

import { CardItem } from '../components/CardItem';
import { cardItemProps, CardsLayout } from '../components/CardsLayout';
import { PageHeaderCard } from '../components/PageHeaderCard';
import { TimeInfo } from '../components/TimeInfo';
import { LoadingCard, UnknownErrorCard } from './../components/CustomCards';
import { tryOperation } from './../utils/form';
import { CreateWorkspaceForm } from './forms/CreateWorkspaceForm';

export const ALL_WORKSPACES = gql`
  {
    workspaces {
      id
      name
      description
      created
      lastChange
    }
  }
`;

const CREATE_WORKSPACE = gql`
  mutation createWorkspace($name: String!, $description: String) {
    createWorkspace(name: $name, description: $description) {
      id
    }
  }
`;

const DELETE_WORKSPACE = gql`
  mutation deleteWorkspace($id: String!) {
    deleteWorkspace(id: $id)
  }
`;

export interface IWorkspacesOverviewPageProps extends RouteComponentProps<{}> {}

export default class WorkspacesOverviewPage extends React.Component<
  IWorkspacesOverviewPageProps
> {
  public render() {
    return (
      <>
        <PageHeaderCard
          title="Workspaces"
          helpContent={
            <>
              <p>
                <strong>Workspaces</strong> are used to aggregate, filter or
                modify <strong>Datasets</strong>.
              </p>
              <p>
                Create one Workspace for each scientific topic to focus on one
                specific issue. Workspaces can have many different Datasets as
                inputs.
              </p>
            </>
          }
        />
        <Query query={ALL_WORKSPACES}>
          {({ loading, error, data, refetch }) => {
            if (loading) {
              return <LoadingCard />;
            }

            if (error) {
              return <UnknownErrorCard error={error} />;
            }

            const workspaces: Array<Workspace> = data.workspaces;

            return (
              <CardsLayout>
                {workspaces.map(ws => (
                  <Col {...cardItemProps} key={ws.id}>
                    <Mutation mutation={DELETE_WORKSPACE}>
                      {deleteWorkspace => (
                        <CardItem
                          path="/workspaces"
                          id={ws.id}
                          name={ws.name}
                          description={ws.description}
                          confirmDeleteMessage="Delete Workspace?"
                          handleDelete={() =>
                            tryOperation({
                              op: () =>
                                deleteWorkspace({
                                  variables: {
                                    id: ws.id
                                  }
                                }),
                              refetch,
                              successTitle: () => 'Workspace deleted',
                              successMessage: () =>
                                `Workspace "${ws.name}" deleted successfully.`,
                              failedTitle: 'Workspace not deleted.',
                              failedMessage: `Workspace "${
                                ws.name
                              }" deletion failed.`
                            })
                          }
                        >
                          <TimeInfo text="Created" time={ws.created} />
                          <TimeInfo text="Last change" time={ws.lastChange} />
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
                    <h2>New Workspace</h2>
                    <Mutation mutation={CREATE_WORKSPACE}>
                      {createWorkspace => (
                        <CreateWorkspaceForm
                          handleCreateWorkspace={(name, description) =>
                            tryOperation({
                              op: async () => {
                                await createWorkspace({
                                  variables: { name, description }
                                });
                                return true;
                              },
                              refetch,
                              successTitle: () => 'Workspace created',
                              successMessage: () =>
                                `Workspace "${name}" created successfully.`,
                              failedTitle: 'Workspace not deleted.',
                              failedMessage: `Workspace  "${name}" creation failed.`
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
