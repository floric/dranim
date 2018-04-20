import * as React from 'react';
import { Row, Col, Card } from 'antd';
import PageHeader from 'ant-design-pro/lib/PageHeader';
import { ComponentClass, SFC } from 'react';

export interface IPageHeaderHoCOptions {
  title: string;
  description?: string;
  includeInCard?: boolean;
}

export const withPageHeaderHoC = ({
  title,
  description,
  includeInCard = true
}: IPageHeaderHoCOptions) => <TOriginalProps extends {}>(
  Component: ComponentClass<TOriginalProps> | SFC<TOriginalProps>
) => (
  <>
    <Card bordered={false}>
      <Row style={{ marginBottom: 12 }}>
        <Col>
          <PageHeader title={title} content={description} />
        </Col>
      </Row>
      {includeInCard && <Component />}
    </Card>

    {!includeInCard && (
      <Row style={{ marginTop: 12 }}>
        <Col>
          <Component />
        </Col>
      </Row>
    )}
  </>
);
