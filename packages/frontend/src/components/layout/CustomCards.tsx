import React, { SFC } from 'react';

import { Colors } from '@masterthesis/shared';
import { Card, Col, Collapse, Divider, Icon, Row, Spin } from 'antd';
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
  error: Error | ApolloError;
}

export const UnknownErrorCard: SFC<UnknownErrorCardProps> = ({ error }) => (
  <CustomErrorCard
    title={error.name}
    description={
      isApolloError(error) ? (
        <>
          {error.networkError ? (
            <p>
              We're sorry. There seems to be a networking issue. Please reload
              try to reload the page.
            </p>
          ) : null}
          {error.graphQLErrors.map((e, id) => (
            <Collapse key={`error-${id}`} bordered={false}>
              <Collapse.Panel
                header={
                  <>
                    <strong>{e.message}</strong> {`[${e.path.join(', ')}]`}
                  </>
                }
                key="1"
              >
                <p>
                  {e.extensions &&
                  e.extensions.exception &&
                  e.extensions.exception.stacktrace
                    ? e.extensions.exception.stacktrace.map(n => (
                        <>
                          {n}
                          <br />
                        </>
                      ))
                    : JSON.stringify(e.extensions.exception.stacktrace)}
                </p>
              </Collapse.Panel>
            </Collapse>
          ))}
        </>
      ) : (
        <p>{error.message}</p>
      )
    }
  />
);

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
