import React, { SFC } from 'react';

import { User } from '@masterthesis/shared';
import { Button, Icon, Tooltip } from 'antd';
import gql from 'graphql-tag';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';

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

const UserInfoImpl: SFC<RouteComponentProps<{}>> = ({ history }) => (
  <HandledQuery<{ user: User | null }> query={USER}>
    {({ data: { user } }) => {
      if (!user) {
        return (
          <>
            <Icon type="user" /> <NavLink to="/login">Login</NavLink> or{' '}
            <NavLink to="/register">Register</NavLink>
          </>
        );
      }

      const { firstName, lastName } = user;
      return (
        <>
          <Icon type="user" /> {firstName} {lastName}
          <Tooltip title="Logout" mouseEnterDelay={1}>
            <Button
              style={{ border: 'none' }}
              icon="logout"
              onClick={() => history.push('/logout')}
            />
          </Tooltip>
        </>
      );
    }}
  </HandledQuery>
);
export const UserInfo = withRouter(UserInfoImpl);
