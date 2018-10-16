import React, { SFC } from 'react';

import { GQLWorkspace } from '@masterthesis/shared';
import { Card, Col, Icon, Row } from 'antd';
import gql from 'graphql-tag';
import { NavLink, RouteComponentProps } from 'react-router-dom';

import { HandledQuery } from '../../components/HandledQuery';
import { VisRenderer } from '../../components/VisRenderer';
import { resultCardSize } from '../../components/visualizations/VisCard';
import { SubtleWarning } from '../../components/Warnings';

const WORKSPACE = gql`
  query workspace($id: ID!) {
    workspace(id: $id) {
      id
      name
      results {
        id
        name
        type
        value
        description
        visible
        workspaceId
      }
    }
    calculations(workspaceId: $id) {
      id
      start
      finish
      state
    }
  }
`;

export interface VisDetailPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

const VisDetailPage: SFC<VisDetailPageProps> = ({
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
        return <p>Unknow Workspace accessed</p>;
      }

      const { results } = workspace;

      if (results.length === 0) {
        return (
          <Card bordered={false} title="No results present">
            <p>You need to start a calculation with Output nodes first.</p>
            <NavLink to="./">
              Go to Editor <Icon type="arrow-right" />
            </NavLink>
          </Card>
        );
      }

      const resultsPath = `/results/${workspaceId}`;

      return (
        <>
          <Card bordered={false} style={{ marginBottom: 8 }}>
            {results.filter(n => n.visible).length > 0 ? (
              <SubtleWarning type="warning">
                Published results can be accessed at{' '}
                <a href={resultsPath} target="_href">
                  <Icon type="link" />{' '}
                  {`${window.location.origin}${resultsPath}`}
                </a>
                . Anybody with this link can access the published results.
              </SubtleWarning>
            ) : (
              <SubtleWarning type="info-circle">
                Use the <Icon type="lock" /> Lock to publish Results.
              </SubtleWarning>
            )}
          </Card>
          <Row gutter={8} type="flex">
            {results.map(r => (
              <Col {...resultCardSize(r)} key={r.id}>
                <VisRenderer result={r} visibility="private" />
              </Col>
            ))}
          </Row>
        </>
      );
    }}
  </HandledQuery>
);

export default VisDetailPage;
