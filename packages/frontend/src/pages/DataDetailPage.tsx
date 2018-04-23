import * as React from 'react';
import { SFC, Component } from 'react';
import { Row, Col, Button, Card, Table } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Exception from 'ant-design-pro/lib/Exception';
import { History } from 'history';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { Spinner } from '../components/Spinner';
import { CreateValueSchemaForm } from './forms/CreateValueSchemaForm';
import { CreateEntryForm } from './forms/CreateEntryForm';
import { ValueSchema } from '../../../common/src/model/valueschema';

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
      }
      entries {
        id
        values
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
  ) {
    addValueSchema(
      datasetId: $datasetId
      name: $name
      type: $type
      required: $required
    ) {
      id
    }
  }
`;

const ADD_ENTRY = gql`
  mutation addEntry($datasetId: String!, $values: String!) {
    addEntry(datasetId: $datasetId, values: $values) {
      id
    }
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
        {({ loading, error, data }) => {
          if (loading) {
            return <Spinner />;
          }

          if (error) {
            return (
              <Card bordered={false}>
                <Exception
                  type="500"
                  title={`Error: ${error.name}`}
                  desc={`An error has happened: ${error.message}`}
                  actions={() => null}
                />
              </Card>
            );
          }

          if (!data.dataset) {
            return (
              <Card bordered={false}>
                <Exception
                  type="404"
                  title="Unknown Dataset"
                  desc={`The dataset with id '${id}' doesn't exist.`}
                  actions={<NoDatasetExceptionActions history={history} />}
                />
              </Card>
            );
          }

          const schemasDataSource = data.dataset.valueschemas.map(
            (e: ValueSchema) => ({
              key: e.name,
              type: e.type,
              required: e.required ? 'true' : 'false'
            })
          );

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
              title: 'Required',
              dataIndex: 'required',
              key: 'required'
            }
          ];

          const entriesDataSource = data.dataset.entries.map((e: any) => ({
            key: e.id,
            values: e.values
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
                            handleCreateValueSchema={schema => {
                              addValueSchema({
                                variables: {
                                  datasetId: id,
                                  name: schema.name,
                                  required: schema.required,
                                  type: schema.type
                                }
                              });
                            }}
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
                  <Row style={{ marginBottom: 12 }}>
                    <Col>
                      <h4>Add Entry</h4>
                      <Mutation mutation={ADD_ENTRY}>
                        {addEntry => (
                          <CreateEntryForm
                            handleCreateEntry={values => {
                              addEntry({
                                variables: {
                                  datasetId: id,
                                  values: JSON.stringify(values)
                                }
                              });
                            }}
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
