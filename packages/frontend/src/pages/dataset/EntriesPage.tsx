import React, { Component } from 'react';

import { Entry, GQLDataset, Values } from '@masterthesis/shared';
import { Card, Col, Row, Table } from 'antd';
import { ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import { Mutation, MutationFn } from 'react-apollo';
import { NavLink } from 'react-router-dom';

import { AsyncButton } from '../../components/AsyncButton';
import { Warning } from '../../components/Warnings';
import { tryOperation } from '../../utils/form';
import { CreateEntryForm } from '../forms/CreateEntryForm';

export interface DataEntriesPageProps {
  dataset: GQLDataset;
  refetch: () => Promise<ApolloQueryResult<any>>;
}

const MAX_PREVIEW_CHARS = 65;

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

const expandedRowRender = (e: { values: Values; key: string }) => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Value', dataIndex: 'value', key: 'value' }
  ];

  const data = Array.from(
    Object.entries(e.values).map(v => ({
      key: `${e.key}-${v[0]}`,
      name: v[0],
      value: JSON.stringify(v[1])
    }))
  );

  return (
    <Table
      size="small"
      columns={columns}
      dataSource={data}
      pagination={false}
    />
  );
};

const generateEntriesDatasource = (entries: Array<Entry>) =>
  entries.map(e => {
    const values = JSON.parse(e.values as any);
    return {
      key: e.id,
      preview:
        e.values.length > MAX_PREVIEW_CHARS
          ? `${e.values.slice(0, MAX_PREVIEW_CHARS - 3)}...`
          : e.values,
      summary: `${Object.keys(values).length} values`,
      values
    };
  });

const handleDeleteEntry = (
  entryId: string,
  datasetId: string,
  refetch: () => Promise<ApolloQueryResult<any>>,
  deleteEntry: MutationFn<any, any>
) =>
  tryOperation({
    op: () =>
      deleteEntry({
        variables: {
          datasetId,
          entryId
        }
      }),
    refetch,
    successTitle: () => 'Entry deleted',
    successMessage: () => `Entry deleted successfully.`,
    failedTitle: 'Entry not deleted.',
    failedMessage: `Entry deletion failed.`
  });

const generateEntryColumns = (
  datasetId: string,
  refetch: () => Promise<ApolloQueryResult<any>>
) => [
  {
    title: 'Preview',
    dataIndex: 'preview',
    key: 'preview'
  },
  {
    title: 'Summary',
    dataIndex: 'summary',
    key: 'summary'
  },
  {
    title: 'Operations',
    dataIndex: 'operation',
    render: (text, record) => (
      <Mutation mutation={DELETE_ENTRY}>
        {deleteEntry => (
          <AsyncButton
            icon="delete"
            type="danger"
            confirmMessage="Delete Entry?"
            confirmClick
            onClick={() =>
              handleDeleteEntry(record.key, datasetId, refetch, deleteEntry)
            }
          />
        )}
      </Mutation>
    )
  }
];

export class DataEntriesPage extends Component<DataEntriesPageProps> {
  private handleCreateEntry = (
    values: any,
    datasetId: string,
    refetch: () => Promise<ApolloQueryResult<any>>,
    addEntry: MutationFn<any, any>
  ) =>
    tryOperation({
      op: () =>
        addEntry({
          variables: {
            datasetId,
            values: JSON.stringify(values)
          }
        }),
      refetch,
      successTitle: () => 'Entry created',
      successMessage: () => `Entry created successfully.`,
      failedTitle: 'Entry not created.',
      failedMessage: `Entry creation failed.`
    });

  public render() {
    const { dataset, refetch } = this.props;
    return (
      <Row style={{ marginBottom: '1rem' }} gutter={12}>
        <Col md={24} lg={12} xl={10}>
          <Card bordered={false}>
            <h3>Add Entry</h3>
            {dataset.valueschemas.length !== 0 ? (
              <Mutation mutation={ADD_ENTRY}>
                {addEntry => (
                  <CreateEntryForm
                    handleCreateEntry={values =>
                      this.handleCreateEntry(
                        values,
                        dataset.id,
                        refetch,
                        addEntry
                      )
                    }
                    schema={dataset.valueschemas}
                  />
                )}
              </Mutation>
            ) : (
              <Warning
                title="Value Schemas needed"
                message="Please add Value Schemas first."
              />
            )}
          </Card>
        </Col>
        <Col md={24} lg={12} xl={14}>
          {dataset.entriesCount > 0 ? (
            <Card bordered={false}>
              <h3>Last Entries</h3>
              <Table
                size="small"
                pagination={{
                  size: 'small',
                  pageSize: 20,
                  hideOnSinglePage: true
                }}
                expandedRowRender={expandedRowRender}
                dataSource={generateEntriesDatasource(dataset.latestEntries)}
                columns={generateEntryColumns(dataset.id, refetch)}
              />
            </Card>
          ) : (
            <Card bordered={false} title="No Entries added yet">
              Create Entries manually here or{' '}
              <NavLink to="./">upload them</NavLink>.
            </Card>
          )}
        </Col>
      </Row>
    );
  }
}
