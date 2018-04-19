import * as React from 'react';
import { Row, Col, Card } from 'antd';
import PageHeader from 'ant-design-pro/lib/PageHeader';
import { css } from 'glamor';

export interface IPageHeaderHoCOptions {
  title: string;
}

export const withPageHeaderHoC = ({ title }: IPageHeaderHoCOptions) => <
  TOriginalProps extends {}
>(
  Component:
    | React.ComponentClass<TOriginalProps>
    | React.StatelessComponent<TOriginalProps>
) => (
  <>
    <Row>
      <Col>
        <Card bordered={false}>
          <PageHeader title={title} content="Description" />
        </Card>
      </Col>
    </Row>
    <Row {...css({ marginTop: '24px' })}>
      <Component />
    </Row>
  </>
);
