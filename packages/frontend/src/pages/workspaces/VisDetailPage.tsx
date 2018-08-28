import * as React from 'react';

import { DataType, GQLOutputResult, GQLWorkspace } from '@masterthesis/shared';
import { Card, Col, Row } from 'antd';
import gql from 'graphql-tag';
import { NavLink, RouteComponentProps } from 'react-router-dom';

import { CustomErrorCard } from '../../components/CustomCards';
import { HandledQuery } from '../../components/HandledQuery';
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

const resultCardSize = (result: GQLOutputResult) =>
  result.type === DataType.VIS
    ? { xs: 24, sm: 24, lg: 12, xxl: 8 }
    : { xs: 24, sm: 12, lg: 6, xxl: 4 };

export interface VisDetailPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

const VisDetailPage: React.SFC<VisDetailPageProps> = ({
  match: {
    params: { workspaceId }
  }
}) => (
  <HandledQuery<{ workspace: null | GQLWorkspace }, { id: string }>
    query={WORKSPACE}
    variables={{ id: workspaceId }}
  >
    {({ data: { workspace } }) => {
      if (!workspace) {
        return (
          <CustomErrorCard
            title="Unknown Workspace"
            description="Workspace doesn't exist."
          />
        );
      }

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
  </HandledQuery>
);

export default VisDetailPage;
