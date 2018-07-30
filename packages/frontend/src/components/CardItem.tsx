import * as React from 'react';

import { Card, Col, Row } from 'antd';
import { Link } from 'react-router-dom';

import { AsyncButton } from './AsyncButton';

export interface CardItemProps {
  id: string;
  name: string;
  description?: string;
  path: string;
  confirmDeleteMessage?: string;
  handleDelete: () => Promise<any>;
}

export const CardItem: React.SFC<CardItemProps> = ({
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
  >
    <Row>{children}</Row>
    <Row type="flex" justify="end" style={{ marginTop: 12 }} gutter={12}>
      <Col>
        <AsyncButton
          type="danger"
          confirmClick={!!confirmDeleteMessage}
          confirmMessage={confirmDeleteMessage}
          icon="delete"
          onClick={handleDelete}
        >
          Delete
        </AsyncButton>
      </Col>
    </Row>
  </Card>
);
