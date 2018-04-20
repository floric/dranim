import * as React from 'react';
import { Row, Col, Card } from 'antd';
import PageHeader from 'ant-design-pro/lib/PageHeader';
import { css } from 'glamor';

export interface IPageHeaderHoCOptions {
  title: string;
  description?: string;
}

export const withPageHeaderHoC = ({
  title,
  description
}: IPageHeaderHoCOptions) => <TOriginalProps extends {}>(
  Component:
    | React.ComponentClass<TOriginalProps>
    | React.StatelessComponent<TOriginalProps>
) => (
  <>
    <Row>
      <Col>
        <Card bordered={false}>
          <PageHeader title={title} content={description} />
        </Card>
      </Col>
    </Row>
    <Row {...css({ marginTop: '24px' })}>
      <Component />
    </Row>
  </>
);
