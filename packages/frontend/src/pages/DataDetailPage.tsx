import * as React from 'react';
import { SFC, Component } from 'react';
import { Row, Col, Button, Card, Table } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { History } from 'history';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import {
  LoadingCard,
  UnknownErrorCard,
  CustomErrorCard
} from '../components/CustomCards';
import { CreateValueSchemaForm } from './forms/CreateValueSchemaForm';
import { CreateEntryForm } from './forms/CreateEntryForm';
import { tryOperation } from '../utils/form';

export interface IDataDetailPageProps
  extends RouteComponentProps<{ id: string }> {}

const NoDatasetExceptionActions: SFC<{ history: History }> = ({ history }) => (
  <Button type="primary" onClick={() => history.push('/data')}>
    Create new Dataset
  </Button>
);

const DATASET = gql`
  query dataset($id: String!) {
    dataset(id: $id) {
      id
      name
      valueschemas {
        name
        type
        required
        fallback
      }
      entries {
        id
        values {
          name
          val
        }
      }
    }
  }
`;

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

const UPLOAD_CSV = gql`
  mutation($file: Upload!) {
    singleUpload(file: $file)
  }
`;

class DataDetailPage extends Component<IDataDetailPageProps> {
  public render() {
    const {
      history,
      match: {
        params: { id }
      }
    } = this.props;

    return (
      <Query query={DATASET} variables={{ id }}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          if (!data.dataset) {
            return (
              <CustomErrorCard
                title="Unknown dataset"
                description="Dataset doesn't exist."
                actions={<NoDatasetExceptionActions history={history} />}
              />
            );
          }

          const schemasDataSource = data.dataset.valueschemas.map(e => ({
            key: e.name,
            type: e.type,
            required: e.required ? 'true' : 'false',
            fallback: e.fallback
          }));

          const schemasColumns = [
            {
              title: 'Name',
              dataIndex: 'key',
              key: 'key'
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
              title: 'Required',
              dataIndex: 'required',
              key: 'required'
            }
          ];

          const entriesDataSource = data.dataset.entries.map(e => ({
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
              render: (text, record) => {
                return (
                  <Mutation mutation={DELETE_ENTRY}>
                    {deleteEntry => (
                      <Button
                        onClick={() =>
                          tryOperation({
                            op: () =>
                              deleteEntry({
                                variables: {
                                  datasetId: id,
                                  entryId: record.key
                                }
                              }),
                            refetch,
                            successTitle: 'Entry deleted',
                            successMessage: `Entry "${
                              record.key
                            }" deleted successfully.`,
                            failedTitle: 'Entry not deleted.',
                            failedMessage: `Entry "${
                              record.key
                            }" deletion failed.`
                          })
                        }
                      >
                        Delete
                      </Button>
                    )}
                  </Mutation>
                );
              }
            }
          ];

          return (
            <Row>
              <Col style={{ marginBottom: 12 }}>
                <Card bordered={false}>
                  <Row style={{ marginBottom: 12 }}>
                    <Col>
                      <h3>Value Schemas</h3>
                      <Table
                        pagination={false}
                        dataSource={schemasDataSource}
                        columns={schemasColumns}
                      />
                    </Col>
                  </Row>
                  <Row style={{ marginBottom: 12 }}>
                    <Col>
                      <h4>Add Value Schema</h4>
                      <Mutation mutation={ADD_VALUE_SCHEMA}>
                        {addValueSchema => (
                          <CreateValueSchemaForm
                            handleCreateValueSchema={schema =>
                              tryOperation({
                                op: () =>
                                  addValueSchema({
                                    variables: {
                                      datasetId: id,
                                      name: schema.name,
                                      required: schema.required,
                                      type: schema.type,
                                      fallback: schema.fallback
                                    }
                                  }),
                                refetch,
                                successTitle: 'Valueschema created',
                                successMessage: `Valueschema "${
                                  schema.name
                                }" created successfully.`,
                                failedTitle: 'Valueschema not created.',
                                failedMessage: `Valueschema  "${
                                  schema.name
                                }" creation failed.`
                              })
                            }
                          />
                        )}
                      </Mutation>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col style={{ marginBottom: 12 }}>
                <Card bordered={false}>
                  <Row style={{ marginBottom: 12 }}>
                    <Col>
                      <h3>Entries</h3>
                      <Table
                        dataSource={entriesDataSource}
                        columns={entriesColumns}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Mutation mutation={UPLOAD_CSV}>
                        {singleUpload => (
                          <form
                            encType="multipart/form-data"
                            method="POST"
                            onSubmit={form => {
                              form.preventDefault();
                              const elem = document.getElementById('grade_csv');
                              if (!elem) {
                                return false;
                              }
                              console.log(elem);
                              const a = (elem as any).files[0];
                              console.log(a);
                              singleUpload({
                                variables: {
                                  file: a
                                }
                              });
                              return false;
                            }}
                          >
                            <input type="file" id="grade_csv" />
                            <input type="submit" value="Generate Report" />
                          </form>
                        )}
                      </Mutation>
                    </Col>
                  </Row>
                  <Row style={{ marginBottom: 12 }}>
                    <Col>
                      <h4>Add Entry</h4>
                      <Mutation mutation={ADD_ENTRY}>
                        {addEntry => (
                          <CreateEntryForm
                            handleCreateEntry={values =>
                              tryOperation({
                                op: () =>
                                  addEntry({
                                    variables: {
                                      datasetId: id,
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
                            schema={data.dataset.valueschemas}
                          />
                        )}
                      </Mutation>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          );
        }}
      </Query>
    );
  }
}

export default withPageHeaderHoC({
  title: 'Details',
  includeInCard: false
})(withRouter(DataDetailPage));
