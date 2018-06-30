import * as React from 'react';

import { User } from '@masterthesis/shared';
import { Card, Col, Icon, Row } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { LoadingCard } from '../components/CustomCards';
import { PageHeaderCard } from '../components/PageHeaderCard';

export const USER = gql`
  {
    user {
      id
      name
      mail
    }
  }
`;

export default class UserPage extends React.Component<{}, {}> {
  public render() {
    return (
      <Query query={USER}>
        {({ loading, error, data }) => {
          if (loading || error) {
            return (
              <>
                <PageHeaderCard title="User" />
                <LoadingCard />
              </>
            );
          }

          const user: User = data.user;

          return (
            <>
              <PageHeaderCard title="User" helpContent={<></>} />
              <Card bordered={false}>
                <Row>
                  <Col xs={12} md={9} lg={6}>
                    <Icon type="user" /> {user.name}
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
