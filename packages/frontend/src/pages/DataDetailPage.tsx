import * as React from 'react';
import { SFC, Component } from 'react';
import { Row, Col, Button, Card } from 'antd';
import { connect, Dispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Exception from 'ant-design-pro/lib/Exception';
import { History } from 'history';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { ValueSchema } from '../../../common/src/model/valueschema';
import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { IRootState } from '../state/reducers/root';
import { actions } from '../state/actions/data';
import { CreateValueSchemaForm } from './forms/CreateValueSchemaForm';

export interface IDataDetailPageProps
  extends RouteComponentProps<{ id: string }> {
  onAddValueSchema: (datasetId: string, val: ValueSchema) => void;
}

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
      valueschema
    }
  }
`;

class DataDetailPage extends Component<IDataDetailPageProps> {
  private handleCreateValueSchema = (val: ValueSchema) =>
    this.props.onAddValueSchema(this.props.match.params.id, val);

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
            return null;
          }
          if (error) {
            return `Error!: ${error}`;
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

          /*const schemasDataSource = schemas.map(e => ({
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
          ];*/

          /*const entriesDataSource = dataset.entries.map(e => ({
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
          ];*/

          return (
            <Row>
              <Col style={{ marginBottom: 12 }}>
                <Card bordered={false}>
                  <Row style={{ marginBottom: 12 }}>
                    <Col>
                      <h3>Value Schemas</h3>
                      {/*<Table
                        dataSource={schemasDataSource}
                        columns={schemasColumns}
                      />*/}
                    </Col>
                  </Row>
                  <Row style={{ marginBottom: 12 }}>
                    <Col>
                      <h4>Add Value Schema</h4>
                      <CreateValueSchemaForm
                        handleCreateValueSchema={this.handleCreateValueSchema}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col style={{ marginBottom: 12 }}>
                <Card bordered={false}>
                  <h3>Data</h3>
                  {/*<Table dataSource={entriesDataSource} columns={entriesColumns} />*/}
                </Card>
              </Col>
            </Row>
          );
        }}
      </Query>
    );
  }
}

const mapStateToProps = (
  state: IRootState,
  props: RouteComponentProps<{ id: string }>
) => ({});

const mapDispatchToProps = (dispatch: Dispatch<IRootState>) => ({
  onAddValueSchema: (datasetId: string, val: ValueSchema) => {
    dispatch(actions.addDatasetSchemaValue(datasetId, val));
  }
});

export default withPageHeaderHoC({
  title: 'Details',
  includeInCard: false
})(withRouter(connect(mapStateToProps, mapDispatchToProps)(DataDetailPage)));
