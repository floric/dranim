import * as React from 'react';
import { SFC, Component } from 'react';
import { Row, Col, Button, Card, Table } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Exception from 'ant-design-pro/lib/Exception';
import { History } from 'history';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { format } from 'date-fns';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { CreateValueSchemaForm } from './forms/CreateValueSchemaForm';

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
      _id
      name
      valueschemas {
        name
        type
        required
      }
      entries {
        time
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
      _id
    }
  }
`;

/*const ADD_ENTRY = gql`
  mutation addEntry($datasetId: String!, $time: String!, $values: String!) {
    addEntry(datasetId: $datasetId, time: $time, values: $values) {
      _id
    }
  }
`;*/

class DataDetailPage extends Component<IDataDetailPageProps> {
  public render() {
    const {
      history,
      match: {
        params: { id }
      }
    } = this.props;

    return (
      <Query query={DATASET} variables={{ id }} pollInterval={5000}>
        {({ loading, error, data }) => {
          if (loading) {
            return null;
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

          const schemasDataSource = data.dataset.valueschemas.map((e: any) => ({
            key: e.name,
            type: e.type,
            required: e.required ? 'true' : 'false'
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
              title: 'Required',
              dataIndex: 'required',
              key: 'required'
            }
          ];

          const entriesDataSource = data.dataset.entries.map((e: any) => ({
            time: format(e.time, 'MM/DD/YYYY'),
            key: e.id,
            values: e.values.size
          }));

          const entriesColumns = [
            {
              title: 'Time',
              dataIndex: 'time',
              key: 'time'
            },
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
                  <h3>Data</h3>
                  <Table
                    dataSource={entriesDataSource}
                    columns={entriesColumns}
                  />
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
