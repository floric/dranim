import * as React from 'react';
import { SFC } from 'react';

import { Colors } from '@masterthesis/shared';
import { Button, Card, Col, Divider, Modal, Row, Tooltip } from 'antd';
import { css } from 'glamor';
import { UserInfo } from './UserInfo';

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
        <Col xs={24} sm={12} md={16} xl={18}>
          <h1 {...css({ marginBottom: 0 })}>
            {title}
            {typeTitle ? (
              <>
                <Divider type="vertical" />
                <span
                  {...css({ color: Colors.GrayMedium, fontWeight: 'initial' })}
                >
                  {typeTitle}
                </span>
              </>
            ) : null}
          </h1>
        </Col>

        <Col xs={24} sm={12} md={8} xl={6} style={{ textAlign: 'right' }}>
          <Row justify="space-between" align="middle">
            <Col>
              {helpContent && (
                <>
                  <Tooltip title="Help" mouseEnterDelay={1}>
                    <Button
                      style={{ border: 'none' }}
                      onClick={() => {
                        showInfo(helpContent);
                      }}
                      icon="question-circle"
                    />
                  </Tooltip>
                  <Divider type="vertical" />
                </>
              )}
              <UserInfo />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  </>
);
