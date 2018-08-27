import * as React from 'react';

import { GQLOutputResult, GQLWorkspace } from '@masterthesis/shared';
import { Card, Col, Row } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { NavLink, RouteComponentProps } from 'react-router-dom';

import {
  CustomErrorCard,
  LoadingCard,
  UnknownErrorCard
} from '../../components/CustomCards';
import { VisRenderer } from '../../components/VisRenderer';

const WORKSPACE = gql`
  query workspace($id: String!) {
    workspace(id: $id) {
      id
      name
      results {
        id
        name
        type
        value
        description
      }
    }
    calculations(workspaceId: $id) {
      id
      start
      finish
      state
      processedOutputs
      totalOutputs
    }
  }
`;

const resultCardSize = (result: GQLOutputResult) => ({ md: 12, xl: 8, xxl: 6 });

export interface VisDetailPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

const VisDetailPage: React.SFC<VisDetailPageProps> = ({
  match: {
    params: { workspaceId }
  }
}) => {
  return (
    <Query query={WORKSPACE} variables={{ id: workspaceId }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <LoadingCard />;
        }

        if (error) {
          return <UnknownErrorCard error={error} />;
        }

        if (!data.workspace) {
          return (
            <CustomErrorCard
              title="Unknown Workspace"
              description="Workspace doesn't exist."
            />
          );
        }

        const workspace: GQLWorkspace = data.workspace;

        if (workspace.results.length === 0) {
          return (
            <Card bordered={false} title="No results present">
              <p>You need to start a calculation with Output nodes first.</p>
              <NavLink to={'/'}>Go to Editor</NavLink>
            </Card>
          );
        }

        return (
          <Row gutter={8} type="flex">
            {workspace.results.map(r => (
              <Col {...resultCardSize(r)} key={r.id}>
                <VisRenderer result={r} />
              </Col>
            ))}
          </Row>
        );
      }}
    </Query>
  );
};

export default VisDetailPage;
