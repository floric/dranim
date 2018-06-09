import * as React from 'react';
import { SFC } from 'react';

import { Colors } from '@masterthesis/shared';
import { Card } from 'antd';
import { css } from 'glamor';

export interface IPageHeaderProps {
  title: string;
  typeTitle?: string;
  marginBottom?: 'small' | 'big' | 'none';
}

export const PageHeaderCard: SFC<IPageHeaderProps> = ({
  title,
  typeTitle,
  marginBottom = 'small'
}) => (
  <>
    <Card
      bordered={false}
      style={{
        marginBottom: marginBottom ? (marginBottom === 'big' ? 32 : 16) : 0
      }}
    >
      <h1 {...css({ marginBottom: 0 })}>
        {title}
        {typeTitle ? (
          <span {...css({ color: Colors.GrayMedium, fontWeight: 'initial' })}> // {typeTitle}
          </span>
        ) : null}
      </h1>
    </Card>
  </>
);
