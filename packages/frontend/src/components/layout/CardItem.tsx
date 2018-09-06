import React, { SFC } from 'react';

import { Card, Row } from 'antd';
import { Link } from 'react-router-dom';

import { AsyncButton } from '../AsyncButton';

export interface CardItemProps {
  id: string;
  name: string;
  description?: string;
  path: string;
  confirmDeleteMessage?: string;
  handleDelete: () => Promise<any>;
}

export const CardItem: SFC<CardItemProps> = ({
  id,
  name,
  handleDelete,
  confirmDeleteMessage,
  path,
  description,
  children
}) => (
  <Card
    title={
      <Card.Meta
        title={<Link to={`${path}/${id}`}>{name}</Link>}
        description={description}
      />
    }
    bordered={false}
    extra={
      <AsyncButton
        type="danger"
        confirmClick={!!confirmDeleteMessage}
        confirmMessage={confirmDeleteMessage}
        icon="delete"
        tooltip="Delete"
        onClick={handleDelete}
      />
    }
  >
    <Row>{children}</Row>
  </Card>
);
