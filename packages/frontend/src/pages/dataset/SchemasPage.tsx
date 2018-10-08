import React, { SFC } from 'react';

import { Colors, GQLDataset } from '@masterthesis/shared';
import { Card, Col, Row, Table, Tag } from 'antd';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import { tryOperation } from '../../utils/form';
import { CreateValueSchemaForm } from '../forms/CreateValueSchemaForm';
import { DATASET } from './DetailPage';

const ADD_VALUE_SCHEMA = gql`
  mutation addValueSchema(
    $datasetId: ID!
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
}

export const DataSchemas: SFC<DataSchemasProps> = ({ dataset }) => {
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
      render: (_, { type }) => <Tag color={Colors[type]}>{type}</Tag>
    },
    {
      title: 'Fallback',
      dataIndex: 'fallback',
      key: 'fallback',
      render: (_, { required, fallback }) => (!required ? fallback : '')
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
            <h3>Add Field</h3>
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
                          },
                          awaitRefetchQueries: true,
                          refetchQueries: [
                            { query: DATASET, variables: { id: dataset.id } }
                          ]
                        }),
                      successTitle: () => 'Field created',
                      successMessage: () =>
                        `Field "${schema.name}" created successfully.`,
                      failedTitle: 'Field not created.',
                      failedMessage: `Field  "${schema.name}" creation failed.`
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
              <h3>Fields</h3>
              <Table<{
                key: string;
                type: string;
                unique: boolean;
                required: boolean;
                fallback: string;
              }>
                size="small"
                pagination={false}
                dataSource={schemasDataSource}
                columns={schemasColumns}
              />
            </Card>
          ) : (
            <Card bordered={false} title="No Fields present">
              You need to add Fields first.
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
};
