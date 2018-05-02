import * as React from 'react';
import { Row, Col, Card } from 'antd';
import PageHeader from 'ant-design-pro/lib/PageHeader';
import { ComponentClass, SFC } from 'react';
import { css } from 'glamor';

export interface IPageHeaderHoCOptions {
  title: string;
  size?: 'small' | 'large';
  description?: string;
  includeInCard?: boolean;
}

export const withPageHeaderHoC = ({
  title,
  description,
  includeInCard = true,
  size = 'large'
}: IPageHeaderHoCOptions) => <TOriginalProps extends {}>(
  Component: ComponentClass<TOriginalProps> | SFC<TOriginalProps>
) => (
  <>
    <Card bordered={false}>
      <Row>
        <Col>
          {size === 'large' ? (
            <PageHeader title={title} content={description} />
          ) : (
            <h1 {...css({ margin: 0 })}>{title}</h1>
          )}
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
