import { Card } from 'antd';
import { css } from 'glamor';
import * as React from 'react';
import { SFC } from 'react';

export interface IPageHeaderProps {
  title: string;
  marginBottom?: 'small' | 'big' | 'none';
}

export const PageHeaderCard: SFC<IPageHeaderProps> = ({
  title,
  marginBottom = 'small'
}) => (
  <>
    <Card
      bordered={false}
      style={{
        marginBottom: marginBottom ? (marginBottom === 'big' ? 32 : 16) : 0
      }}
    >
      <h1 {...css({ marginBottom: 0 })}>{title}</h1>
    </Card>
  </>
);
