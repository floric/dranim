import * as React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { Row, Col, Card, Tooltip } from 'antd';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import { distanceInWordsToNow } from 'date-fns';

import { LoadingCard, UnknownErrorCard } from './../components/CustomCards';
import { tryOperation } from './../utils/form';
import { AsyncButton } from './../components/AsyncButton';
import { CreateWorkspaceForm } from './forms/CreateWorkspaceForm';
import {
  NodeInstance,
  ConnectionInstance
} from './workspaces/explorer/ExplorerEditor';
import { PageHeaderCard } from '../components/PageHeaderCard';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  lastChange: string;
  created: string;
  nodes: Array<NodeInstance>;
  connections: Array<ConnectionInstance>;
}

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
  IWorkspacesOverviewPageProps,
  { saving: boolean }
> {
  public componentWillMount() {
    this.setState({ saving: false });
  }

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
                    <Card
                      bordered={false}
                      title={
                        <Card.Meta
                          title={
                            <Link to={`/workspaces/${ws.id}`}>{ws.name}</Link>
                          }
                          description={ws.description}
                        />
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
                      <Row
                        type="flex"
                        justify="end"
                        style={{ marginTop: 12 }}
                        gutter={8}
                      >
                        <Col>
                          <Mutation mutation={DELETE_WORKSPACE}>
                            {deleteWorkspace => (
                              <AsyncButton
                                confirmClick
                                confirmMessage="Delete Workspace?"
                                icon="delete"
                                loading={this.state.saving}
                                onClick={async () => {
                                  await this.setState({ saving: true });
                                  await tryOperation({
                                    op: () =>
                                      deleteWorkspace({
                                        variables: {
                                          id: ws.id
                                        }
                                      }),
                                    refetch,
                                    successTitle: () => 'Workspace deleted',
                                    successMessage: () =>
                                      `Workspace "${
                                        ws.name
                                      }" deleted successfully.`,
                                    failedTitle: 'Workspace not deleted.',
                                    failedMessage: `Workspace "${
                                      ws.name
                                    }" deletion failed.`
                                  });
                                  await this.setState({ saving: false });
                                }}
                              >
                                Delete
                              </AsyncButton>
                            )}
                          </Mutation>
                        </Col>
                      </Row>
                    </Card>
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
