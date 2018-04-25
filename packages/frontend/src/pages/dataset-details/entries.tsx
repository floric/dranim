import * as React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Col, Row, Table } from 'antd';
import { tryOperation } from '../../utils/form';
import { CreateEntryForm } from '../forms/CreateEntryForm';
import { Dataset } from '../../utils/model';
import { ApolloQueryResult } from 'apollo-client';
import Card from 'antd/lib/card';

export interface DataEntriesProps {
  dataset: Dataset;
  refetch: () => Promise<ApolloQueryResult<any>>;
}

const ADD_ENTRY = gql`
  mutation addEntry($datasetId: String!, $values: String!) {
    addEntry(datasetId: $datasetId, values: $values) {
      id
    }
  }
`;

const DELETE_ENTRY = gql`
  mutation deleteEntry($datasetId: String!, $entryId: String!) {
    deleteEntry(datasetId: $datasetId, entryId: $entryId)
  }
`;

export class DataEntries extends React.Component<DataEntriesProps, {}> {
  public render() {
    const { dataset, refetch } = this.props;
    const entriesDataSource = dataset.entries.map(e => ({
      key: e.id,
      values: JSON.stringify(e.values.map(v => ({ [v.name]: v.val })))
    }));

    const entriesColumns = [
      {
        title: 'Index',
        dataIndex: 'key',
        key: 'key'
      },
      {
        title: 'Values',
        dataIndex: 'values',
        key: 'values'
      },
      {
        title: 'Operations',
        dataIndex: 'operation',
        render: (text, record) => (
          <Mutation mutation={DELETE_ENTRY}>
            {deleteEntry => (
              <Button
                onClick={() =>
                  tryOperation({
                    op: () =>
                      deleteEntry({
                        variables: {
                          datasetId: dataset.id,
                          entryId: record.key
                        }
                      }),
                    refetch,
                    successTitle: 'Entry deleted',
                    successMessage: `Entry "${
                      record.key
                    }" deleted successfully.`,
                    failedTitle: 'Entry not deleted.',
                    failedMessage: `Entry "${record.key}" deletion failed.`
                  })
                }
              >
                Delete
              </Button>
            )}
          </Mutation>
        )
      }
    ];

    return (
      <>
        <Row style={{ marginBottom: 12 }}>
          <Col>
            <Card bordered={false}>
              <h3>Add Entry</h3>
              <Mutation mutation={ADD_ENTRY}>
                {addEntry => (
                  <CreateEntryForm
                    handleCreateEntry={values =>
                      tryOperation({
                        op: () =>
                          addEntry({
                            variables: {
                              datasetId: dataset.id,
                              values: JSON.stringify(values)
                            }
                          }),
                        refetch,
                        successTitle: 'Entry created',
                        successMessage: `Entry created successfully.`,
                        failedTitle: 'Entry not created.',
                        failedMessage: `Entry creation failed.`
                      })
                    }
                    schema={dataset.valueschemas}
                  />
                )}
              </Mutation>
            </Card>
          </Col>
        </Row>
        <Row style={{ marginBottom: 12 }}>
          <Col>
            <Card bordered={false}>
              <h3>Entries</h3>
              <Table dataSource={entriesDataSource} columns={entriesColumns} />
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
