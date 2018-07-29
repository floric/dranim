import * as React from 'react';

import { User } from '@masterthesis/shared';
import { Button, Icon, Tooltip } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { LoadingCard } from '../components/CustomCards';

export const USER = gql`
  {
    user {
      id
      firstName
      lastName
    }
  }
`;

class UserInfoImpl extends React.Component<RouteComponentProps<{}>, {}> {
  private handleLogout = () => {
    this.props.history.push('/logout');
  };

  public render() {
    return (
      <Query query={USER}>
        {({ loading, error, data }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return null;
          }

          const user: User = data.user;

          return (
            <>
              <Icon type="user" /> {user.firstName} {user.lastName}
              <Tooltip title="Logout" mouseEnterDelay={1}>
                <Button
                  style={{ border: 'none' }}
                  icon="logout"
                  onClick={this.handleLogout}
                />
              </Tooltip>
            </>
          );
        }}
      </Query>
    );
  }
}

export const UserInfo = withRouter(UserInfoImpl);
