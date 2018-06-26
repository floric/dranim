import * as React from 'react';

import { DataType, GQLDashboard, GQLOutputResult } from '@masterthesis/shared';
import { Card, Col, Row } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';

import { BooleanInfo } from '../../components/BooleanInfo';
import {
  CustomErrorCard,
  LoadingCard,
  UnknownErrorCard
} from '../../components/CustomCards';
import { NumberInfo } from '../../components/NumberInfo';
import { PageHeaderCard } from '../../components/PageHeaderCard';
import { StringInfo } from '../../components/StringInfo';

const DASHBOARD = gql`
  query dashboard($id: String!) {
    dashboard(id: $id) {
      id
      name
      results {
        id
        name
        value
        type
        description
      }
    }
  }
`;

const resultCardSize = { xs: 24, md: 12, lg: 8, xl: 6 };

export interface VisDetailPageProps
  extends RouteComponentProps<{ id: string }> {}

export default class VisDetailPage extends React.Component<VisDetailPageProps> {
  public render() {
    return (
      <Query query={DASHBOARD} variables={{ id: this.props.match.params.id }}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          if (!data.dashboard) {
            return (
              <CustomErrorCard
                title="Unknown Dashboard"
                description="Dashboard doesn't exist."
              />
            );
          }

          const dashboard: GQLDashboard = data.dashboard;

          return (
            <>
              <PageHeaderCard title={dashboard.name} typeTitle="Dashboard" />
              <Row gutter={8}>
                {dashboard.results.map(r => (
                  <Col {...resultCardSize} key={r.id}>
                    <Card bordered={false}>{renderResult(r)}</Card>
                  </Col>
                ))}
              </Row>
            </>
          );
        }}
      </Query>
    );
  }
}

const renderResult = (result: GQLOutputResult): JSX.Element => {
  if (result.type === DataType.NUMBER) {
    return <NumberInfo title={result.name} total={result.value} />;
  } else if (result.type === DataType.STRING) {
    return <StringInfo title={result.name} value={result.value} />;
  } else if (result.type === DataType.BOOLEAN) {
    return <BooleanInfo title={result.name} value={result.value} />;
  }

  return <p>Not yet supported Datatype</p>;
};
