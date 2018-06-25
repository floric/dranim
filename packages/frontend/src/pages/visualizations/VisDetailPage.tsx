import * as React from 'react';

import { GQLDashboard } from '@masterthesis/shared';
import { Card } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';

import {
  CustomErrorCard,
  LoadingCard,
  UnknownErrorCard
} from '../../components/CustomCards';
import { PageHeaderCard } from '../../components/PageHeaderCard';

const DASHBOARD = gql`
  query dashboard($id: String!) {
    dashboard(id: $id) {
      id
      name
    }
  }
`;

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
              <Card bordered={false}>Show dashboard content here</Card>
            </>
          );
        }}
      </Query>
    );
  }
}
