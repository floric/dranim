import React, { Component } from 'react';

import { User } from '@masterthesis/shared';
import { Button, Icon, Tooltip } from 'antd';
import gql from 'graphql-tag';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { HandledQuery } from '../HandledQuery';

export const USER = gql`
  {
    user {
      id
      firstName
      lastName
    }
  }
`;

class UserInfoImpl extends Component<RouteComponentProps<{}>, {}> {
  private handleLogout = () => this.props.history.push('/logout');

  public render() {
    return (
      <HandledQuery<{ user: User }> query={USER}>
        {({
          data: {
            user: { firstName, lastName }
          }
        }) => (
          <>
            <Icon type="user" /> {firstName} {lastName}
            <Tooltip title="Logout" mouseEnterDelay={1}>
              <Button
                style={{ border: 'none' }}
                icon="logout"
                onClick={this.handleLogout}
              />
            </Tooltip>
          </>
        )}
      </HandledQuery>
    );
  }
}

export const UserInfo = withRouter(UserInfoImpl);
