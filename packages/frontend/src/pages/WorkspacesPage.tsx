import * as React from 'react';

import { Workspace } from '@masterthesis/shared';
import { Card, Col, Row, Tooltip } from 'antd';
import { distanceInWordsToNow } from 'date-fns';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';

import { CardItem } from '../components/CardItem';
import { PageHeaderCard } from '../components/PageHeaderCard';
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
        <PageHeaderCard title="Workspaces" />
        <Query query={ALL_WORKSPACES}>
          {({ loading, error, data, refetch }) => {
            if (loading) {
              return <LoadingCard />;
            }

            if (error) {
              return <UnknownErrorCard error={error} />;
            }

            return (
              <Row gutter={12} style={{ marginBottom: 12 }}>
                {data.workspaces.map((ws: Workspace) => (
                  <Col
                    key={`card-${ws.id}`}
                    xs={{ span: 24 }}
                    md={{ span: 12 }}
                    xl={{ span: 8 }}
                    style={{ marginBottom: 12 }}
                  >
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
                          <Row>
                            <Col xs={6}>Created:</Col>
                            <Col xs={18}>
                              <Tooltip title={ws.created}>
                                {distanceInWordsToNow(ws.created, {
                                  includeSeconds: true,
                                  addSuffix: true
                                })}
                              </Tooltip>
                            </Col>
                          </Row>
                          <Row>
                            <Col xs={6}>Last change:</Col>
                            <Col xs={18}>
                              <Tooltip title={ws.lastChange}>
                                {distanceInWordsToNow(ws.lastChange, {
                                  includeSeconds: true,
                                  addSuffix: true
                                })}
                              </Tooltip>
                            </Col>
                          </Row>
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
              </Row>
            );
          }}
        </Query>
      </>
    );
  }
}
