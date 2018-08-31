import React, { SFC } from 'react';

import { Colors, GQLDataset } from '@masterthesis/shared';
import { Card, Col, Row, Table, Tag } from 'antd';
import { ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { tryOperation } from '../../utils/form';
import { CreateValueSchemaForm } from '../forms/CreateValueSchemaForm';

const ADD_VALUE_SCHEMA = gql`
  mutation addValueSchema(
    $datasetId: String!
    $name: String!
    $type: String!
    $required: Boolean!
    $fallback: String!
    $unique: Boolean!
  ) {
    addValueSchema(
      datasetId: $datasetId
      name: $name
      type: $type
      required: $required
      fallback: $fallback
      unique: $unique
    )
  }
`;

export interface DataSchemasProps {
  dataset: GQLDataset;
  refetch: () => Promise<ApolloQueryResult<any>>;
}

export const DataSchemas: SFC<DataSchemasProps> = ({ refetch, dataset }) => {
  const schemasDataSource = dataset.valueschemas.map(e => ({
    key: e.name,
    type: e.type,
    unique: e.unique,
    required: e.required,
    fallback: e.fallback
  }));

  const schemasColumns = [
    {
      title: 'Name',
      dataIndex: 'key',
      key: 'key',
      render: (name, { unique }) =>
        unique === true ? <strong>{name}</strong> : name
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (_, record) => (
        <Tag color={Colors[record.type]}>{record.type}</Tag>
      )
    },
    {
      title: 'Fallback',
      dataIndex: 'fallback',
      key: 'fallback'
    },
    {
      title: 'Properties',
      dataIndex: 'properties',
      key: 'properties',
      render: (_, { unique, required }) => (
        <>
          {unique && <Tag>Unique</Tag>}
          {required && <Tag>Required</Tag>}
        </>
      )
    }
  ];

  return (
    <>
      <Row style={{ marginBottom: '1rem' }}>
        <Col>
          <Card bordered={false}>
            <h3>Add Value Schema</h3>
            <Mutation mutation={ADD_VALUE_SCHEMA}>
              {addValueSchema => (
                <CreateValueSchemaForm
                  handleCreateValueSchema={schema =>
                    tryOperation({
                      op: () =>
                        addValueSchema({
                          variables: {
                            datasetId: dataset.id,
                            name: schema.name,
                            required: schema.required,
                            type: schema.type,
                            fallback: schema.fallback,
                            unique: schema.unique
                          }
                        }),
                      refetch,
                      successTitle: () => 'Valueschema created',
                      successMessage: () =>
                        `Valueschema "${schema.name}" created successfully.`,
                      failedTitle: 'Valueschema not created.',
                      failedMessage: `Valueschema  "${
                        schema.name
                      }" creation failed.`
                    })
                  }
                />
              )}
            </Mutation>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col style={{ marginBottom: '1rem' }}>
          {schemasDataSource.length > 0 ? (
            <Card bordered={false}>
              <h3>Value Schemas</h3>
              <Table
                size="small"
                pagination={false}
                dataSource={schemasDataSource}
                columns={schemasColumns}
              />
            </Card>
          ) : (
            <Card bordered={false} title="No Value Schemas present">
              You need to add Value Schemas first.
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
};
