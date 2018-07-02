import * as React from 'react';
import { SFC } from 'react';

import { Colors } from '@masterthesis/shared';
import { Button, Card, Col, Modal, Row } from 'antd';
import { css } from 'glamor';

export interface IPageHeaderProps {
  title: string;
  typeTitle?: string;
  marginBottom?: 'small' | 'big' | 'none';
  helpContent?: JSX.Element;
}

const showInfo = (content: JSX.Element) => {
  Modal.info({
    title: 'Help',
    content,
    onOk() {
      //
    }
  });
};

export const PageHeaderCard: SFC<IPageHeaderProps> = ({
  title,
  typeTitle,
  marginBottom = 'small',
  helpContent
}) => (
  <>
    <Card
      bordered={false}
      style={{
        marginBottom: marginBottom ? (marginBottom === 'big' ? 32 : 16) : 0
      }}
    >
      <Row justify="space-between" align="middle">
        <Col xs={24} md={helpContent ? 20 : 24}>
          <h1 {...css({ marginBottom: 0 })}>
            {title}
            {typeTitle ? (
              <span
                {...css({ color: Colors.GrayMedium, fontWeight: 'initial' })}
              >
                {` | ${typeTitle}`}
              </span>
            ) : null}
          </h1>
        </Col>
        {helpContent && (
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Button
              onClick={() => {
                showInfo(helpContent);
              }}
              icon="question-circle"
            >
              Help
            </Button>
          </Col>
        )}
      </Row>
    </Card>
  </>
);
