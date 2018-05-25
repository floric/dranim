import * as React from 'react';
import { SFC } from 'react';

import { Button, Card, Col, Icon, List, Row, Spin } from 'antd';
import { SpinProps } from 'antd/lib/spin';
import { css } from 'glamor';
import { History } from 'history';
import { withRouter } from 'react-router';

import { ApolloError, isApolloError } from 'apollo-client/errors/ApolloError';

export const LoadingIcon = (
  <Icon type="loading" style={{ fontSize: 24 }} spin />
);

const DefaultErrorActionsImpl: SFC<{ history: History }> = ({ history }) => (
  <Button type="primary" onClick={() => history.push('/')}>
    Return to Start
  </Button>
);

const DefaultErrorActions = withRouter(DefaultErrorActionsImpl);

export const LoadingCard: SFC<SpinProps> = props => (
  <Row>
    <Col>
      <Card bordered={false} {...css({ textAlign: 'center' })}>
        <Spin indicator={LoadingIcon} {...props} />
      </Card>
    </Col>
  </Row>
);

export const Exception: SFC<{
  title: string;
  desc: JSX.Element | string;
  actions: JSX.Element;
}> = ({ title, desc, actions }) => <p>{title}</p>;

export interface UnknownErrorCardProps {
  error: Error;
}

export const UnknownErrorCard: SFC<UnknownErrorCardProps> = ({ error }) => {
  const apolloError = isApolloError(error);
  const description = (
    <div>
      <p>{error.message}</p>
      {apolloError && (
        <List
          size="small"
          header={<strong>Path:</strong>}
          itemLayout="horizontal"
          dataSource={(error as ApolloError).graphQLErrors.map(
            e => `${e.path} - ${e.message}`
          )}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
      )}
    </div>
  );

  return (
    <Card bordered={false}>
      <Exception
        title={error.name}
        desc={description}
        actions={<DefaultErrorActions />}
      />
    </Card>
  );
};

export interface CustomErrorCardProps {
  title: string;
  description: string;
  actions?: JSX.Element;
  type?: '500' | '404' | '403';
}

export const CustomErrorCard: SFC<CustomErrorCardProps> = ({
  title,
  description,
  actions,
  type = '500'
}) => (
  <Card bordered={false}>
    <Exception
      title={title}
      desc={description}
      actions={<DefaultErrorActions />}
    />
  </Card>
);
