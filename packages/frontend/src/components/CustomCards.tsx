import * as React from 'react';
import { SFC } from 'react';
import { Spin, Icon, Row, Col, Card, Button, List } from 'antd';
import { SpinProps } from 'antd/lib/spin';
import { css } from 'glamor';
import Exception from 'ant-design-pro/lib/Exception';
import { isApolloError, ApolloError } from 'apollo-client/errors/ApolloError';
import { History } from 'history';
import { withRouter } from 'react-router';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

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
        <Spin indicator={antIcon} {...props} />
      </Card>
    </Col>
  </Row>
);

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
        type="500"
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
}

export const CustomErrorCard: SFC<CustomErrorCardProps> = ({
  title,
  description,
  actions
}) => (
  <Card bordered={false}>
    <Exception
      type="500"
      title={title}
      desc={description}
      actions={actions ? actions : () => <DefaultErrorActions />}
    />
  </Card>
);
