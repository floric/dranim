import React, { SFC } from 'react';

import { Colors } from '@masterthesis/shared';
import { Card, Col, Divider, Icon, List, Row, Spin } from 'antd';
import { SpinProps } from 'antd/lib/spin';

import { ApolloError, isApolloError } from 'apollo-client/errors/ApolloError';

export const LoadingIcon = (
  <Icon type="loading" style={{ fontSize: 24 }} spin />
);

export const LoadingCard: SFC<SpinProps & { text?: string }> = ({
  children,
  text,
  ...otherProps
}) => (
  <Card bordered={false} style={{ textAlign: 'center' }}>
    <Spin indicator={LoadingIcon} {...otherProps} />
    <p>{text || 'Loading...'}</p>
    {children}
  </Card>
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

  return <CustomErrorCard title={error.name} description={description} />;
};

export interface CustomErrorCardProps {
  title: string;
  description: string | JSX.Element;
  actions?: JSX.Element;
}

export const CustomErrorCard: SFC<CustomErrorCardProps> = ({
  title,
  description,
  actions
}) => (
  <Card
    bordered={false}
    title={
      <>
        <Icon type="warning" style={{ color: Colors.Error }} /> {title}
      </>
    }
  >
    <Row>
      <Col>{description}</Col>
      {actions ? (
        <>
          <Divider />
          <Col>{actions}</Col>
        </>
      ) : null}
    </Row>
  </Card>
);
