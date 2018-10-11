import React, { SFC } from 'react';

import { Colors, GQLPublicResults, User } from '@masterthesis/shared';
import { Card, Col, Divider, Layout, Row } from 'antd';
import gql from 'graphql-tag';
import { NavLink, RouteComponentProps } from 'react-router-dom';

import { AsyncButton } from '../../components/AsyncButton';
import { HandledQuery } from '../../components/HandledQuery';
import { TimeInfo } from '../../components/infos/TimeInfo';
import { CustomErrorCard } from '../../components/layout/CustomCards';
import { Footer } from '../../components/layout/Footer';
import { PageHeaderCard } from '../../components/layout/PageHeaderCard';
import { VisRenderer } from '../../components/VisRenderer';
import { resultCardSize } from '../../components/visualizations/VisCard';

const RESULTS = gql`
  query results($workspaceId: ID!) {
    results(workspaceId: $workspaceId) {
      id
      name
      description
      created
      lastChange
      userId
      results {
        id
        name
        type
        value
        description
      }
    }
    user {
      id
    }
  }
`;

export interface ResultsPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

const ResultsPage: SFC<ResultsPageProps> = ({
  match: {
    params: { workspaceId }
  }
}) => (
  <HandledQuery<
    { results: GQLPublicResults | null; user: User | null },
    { workspaceId: string }
  >
    query={RESULTS}
    variables={{ workspaceId }}
  >
    {({ data: { results, user } }) => {
      if (!results) {
        return (
          <CustomErrorCard
            title="Unknown Results"
            description="This link to a Results page seems to be invalid or the associated workspaces has been deleted."
          />
        );
      }

      const {
        results: publicResults,
        name,
        description,
        lastChange,
        created
      } = results;

      return (
        <Layout style={{ minHeight: '100vh' }}>
          <Layout.Content
            style={{ background: Colors.Background, padding: 16 }}
          >
            <Row>
              <PageHeaderCard
                title={name}
                typeTitle="Results"
                endContent={
                  <Row justify="start" type="flex" gutter={8}>
                    <Col>
                      <TimeInfo text="Created" time={created} />
                      <TimeInfo text="Last change" time={lastChange} />
                    </Col>
                    {description ? (
                      <>
                        <Col>
                          <Divider type="vertical" style={{ height: '100%' }} />
                        </Col>
                        <Col>{description}</Col>
                      </>
                    ) : null}
                  </Row>
                }
              />
            </Row>
            {publicResults.length > 0 ? (
              <Row gutter={8} type="flex">
                {publicResults.map(r => (
                  <Col {...resultCardSize(r)} key={r.id}>
                    <VisRenderer result={r} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Card bordered={false} style={{ marginBottom: 16 }}>
                {user != null && user.id === results.userId ? (
                  <>
                    This Workspace doesn't have any published results yet. Go to
                    the{' '}
                    <NavLink to={`/workspaces/${results.id}/results`}>
                      results page
                    </NavLink>{' '}
                    to publish selected results.
                  </>
                ) : (
                  <>This Workspace doesn't have any published results yet.</>
                )}
              </Card>
            )}
            {/* Ugly Hack to preven Parcel from not finding AsyncButton */}
            {publicResults.length < 0 && <AsyncButton />}
          </Layout.Content>
          <Footer />
        </Layout>
      );
    }}
  </HandledQuery>
);

export default ResultsPage;
