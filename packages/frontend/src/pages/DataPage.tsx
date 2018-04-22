import * as React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card } from 'antd';
import { connect } from 'react-redux';
import NumberInfo from 'ant-design-pro/lib/NumberInfo';
import { Mutation } from 'react-apollo';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { actions } from '../state/actions/data';
import { Dispatch } from 'redux';
import { IRootState } from '../state/reducers/root';
import { Dataset } from '../../../common/src/model/dataset';
import { CreateDataSetForm } from './forms/CreateDatasetForm';
import gql from 'graphql-tag';

const CREATE_DATASET = gql`
  mutation createDataset($name: String!) {
    createDataset(name: $name) {
      _id
    }
  }
`;

class DataPage extends React.Component<{
  datasets: Array<Dataset>;
  onAddDataset: (name: string) => void;
}> {
  public render() {
    const { datasets } = this.props;
    return (
      <Row gutter={12} style={{ marginBottom: 12 }}>
        {datasets.map(ds => (
          <Col
            key={`card-${ds.id}`}
            xs={{ span: 24 }}
            md={{ span: 12 }}
            xl={{ span: 8 }}
            style={{ marginBottom: 12 }}
          >
            <Card bordered={false}>
              <h2>
                <Link to={`/data/${ds.id}`}>{ds.name}</Link>
              </h2>
              <Row>
                <Col xs={{ span: 24 }} md={{ span: 12 }}>
                  <NumberInfo total={ds.schema.entries.size} title="Schemas" />
                </Col>
                <Col xs={{ span: 24 }} md={{ span: 12 }}>
                  <NumberInfo total={ds.entries.length} title="Entries" />
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
        <Col
          xs={{ span: 24 }}
          md={{ span: 12 }}
          xl={{ span: 8 }}
          style={{ marginBottom: 12 }}
        >
          <Card bordered={false}>
            <Mutation mutation={CREATE_DATASET}>
              {(createDataset, { data }) => (
                <CreateDataSetForm
                  handleCreateDataset={name => {
                    createDataset({ variables: { name } });
                  }}
                />
              )}
            </Mutation>
          </Card>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  datasets: Array.from(state.data.datasets.values())
});

const mapDispatchToProps = (dispatch: Dispatch<IRootState>) => ({
  onAddDataset: (name: string) => {
    const dataset = new Dataset(name);
    dispatch(actions.addDataset(dataset, dataset.id));
  }
});

export default withPageHeaderHoC({ title: 'Data', includeInCard: false })(
  connect(mapStateToProps, mapDispatchToProps)(DataPage)
);
