import React, { SFC } from 'react';

import { GQLWorkspace } from '@masterthesis/shared';
import { Card, Col } from 'antd';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';

import { HandledQuery } from '../components/HandledQuery';
import { TimeInfo } from '../components/infos/TimeInfo';
import { CardItem } from '../components/layout/CardItem';
import { cardItemProps, CardsLayout } from '../components/layout/CardsLayout';
import { PageHeaderCard } from '../components/layout/PageHeaderCard';
import { compareByName } from '../utils/data';
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
      results {
        id
      }
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
  mutation deleteWorkspace($id: ID!) {
    deleteWorkspace(id: $id)
  }
`;

export interface WorkspacesOverviewPageProps extends RouteComponentProps<{}> {}

const WorkspacesOverviewPage: SFC<WorkspacesOverviewPageProps> = () => (
  <>
    <PageHeaderCard
      title="Workspaces"
      helpContent={
        <>
          <p>
            <strong>Workspaces</strong> are used to aggregate, filter or modify{' '}
            <strong>Tables</strong>.
          </p>
          <p>
            Create one Workspace for each scientific topic to focus on one
            specific issue. Workspaces can have many different Tables as inputs.
          </p>
        </>
      }
    />
    <HandledQuery<{ workspaces: Array<GQLWorkspace> }> query={ALL_WORKSPACES}>
      {({ data: { workspaces } }) => (
        <CardsLayout>
          {Array.from(workspaces)
            .sort(compareByName)
            .map(ws => (
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
                              },
                              awaitRefetchQueries: true,
                              refetchQueries: [{ query: ALL_WORKSPACES }]
                            }),
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
            style={{ marginBottom: '1rem' }}
          >
            <Card bordered={false}>
              <h2>New Workspace</h2>
              <Mutation mutation={CREATE_WORKSPACE}>
                {createWorkspace => (
                  <CreateWorkspaceForm
                    handleCreateWorkspace={(name, description) =>
                      tryOperation<any>({
                        op: () =>
                          createWorkspace({
                            variables: { name, description },
                            awaitRefetchQueries: true,
                            refetchQueries: [{ query: ALL_WORKSPACES }]
                          }),
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
      )}
    </HandledQuery>
  </>
);

export default WorkspacesOverviewPage;
