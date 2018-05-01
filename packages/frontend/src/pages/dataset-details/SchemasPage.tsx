import * as React from 'react';
import { ApolloQueryResult } from 'apollo-client';
import { Row, Table, Col, Card, Tag } from 'antd';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { Dataset } from '../../utils/model';
import { CreateValueSchemaForm } from '../forms/CreateValueSchemaForm';
import { tryOperation } from '../../utils/form';

const ADD_VALUE_SCHEMA = gql`
  mutation addValueSchema(
    $datasetId: String!
    $name: String!
    $type: String!
    $required: Boolean!
    $fallback: String!
  ) {
    addValueSchema(
      datasetId: $datasetId
      name: $name
      type: $type
      required: $required
      fallback: $fallback
    )
  }
`;

export interface DataSchemasProps {
  dataset: Dataset;
  refetch: () => Promise<ApolloQueryResult<any>>;
}

export class DataSchemas extends React.Component<DataSchemasProps, {}> {
  public render() {
    const { refetch, dataset } = this.props;
    const schemasDataSource = dataset.valueschemas.map(e => ({
      key: e.name,
      type: e.type,
      unique: e.unique,
      required: e.required ? 'true' : 'false',
      fallback: e.fallback
    }));

    const schemasColumns = [
      {
        title: 'Name',
        dataIndex: 'key',
        key: 'key',
        render: (name, record) =>
          record.unique === true ? <strong>{name}</strong> : name
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type'
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
        render: (_, record) => (
          <>
            {record.unique && <Tag>Unique</Tag>}
            {record.required && <Tag>Required</Tag>}
          </>
        )
      }
    ];

    return (
      <>
        <Row style={{ marginBottom: 12 }}>
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
          <Col style={{ marginBottom: 12 }}>
            <Card bordered={false}>
              <Row style={{ marginBottom: 12 }}>
                <Col>
                  <h3>Value Schemas</h3>
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={schemasDataSource}
                    columns={schemasColumns}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}