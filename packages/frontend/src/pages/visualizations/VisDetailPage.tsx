import * as React from 'react';

import { GQLVisualization } from '@masterthesis/shared';
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

const VISUALIZATION = gql`
  query visualization($id: String!) {
    visualization(id: $id) {
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
      <Query
        query={VISUALIZATION}
        variables={{ id: this.props.match.params.id }}
      >
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          if (!data.visualization) {
            return (
              <CustomErrorCard
                title="Unknown visualization"
                description="Visualization doesn't exist."
              />
            );
          }

          const visualization: GQLVisualization = data.visualization;

          return (
            <>
              <PageHeaderCard
                title={visualization.name}
                typeTitle="Visualization"
              />
              <Card bordered={false}>Suggest visualizations here</Card>
            </>
          );
        }}
      </Query>
    );
  }
}
