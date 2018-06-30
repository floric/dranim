import * as React from 'react';

import { User } from '@masterthesis/shared';
import { Card, Col, Icon, Row } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';
import { PageHeaderCard } from '../components/PageHeaderCard';

export const USER = gql`
  {
    user {
      id
      firstName
      lastName
      mail
    }
  }
`;

export default class UserPage extends React.Component<{}, {}> {
  public render() {
    return (
      <Query query={USER}>
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <>
                <PageHeaderCard title="User" />
                <LoadingCard />
              </>
            );
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          const user: User = data.user;

          return (
            <>
              <PageHeaderCard title="User" />
              <Card bordered={false}>
                <Row>
                  <Col xs={12} md={9} lg={6}>
                    <Icon type="user" /> {user.firstName} {user.lastName}
                  </Col>
                  <Col xs={12} md={9} lg={6}>
                    <Icon type="mail" /> {user.mail}
                  </Col>
                </Row>
              </Card>
            </>
          );
        }}
      </Query>
    );
  }
}
