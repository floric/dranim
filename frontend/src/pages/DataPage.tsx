import * as React from 'react';
import { Row, Col, Card } from 'antd';
import { connect } from 'react-redux';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { actions } from '../state/actions/data';
import { Dispatch } from 'redux';
import { IRootState } from '../state/reducers/root';
import { Dataset } from '../model/dataset';
import { CreateDataSetForm } from './forms/CreateDatasetForm';

class DataPage extends React.Component<{
  datasets: Map<string, Dataset>;
  onAddDataset: (name: string) => void;
}> {
  public render() {
    return (
      <Row>
        <Col>
          <Card bordered={false}>
            <h3>Add Dataset</h3>
            <CreateDataSetForm handleCreateDataset={this.props.onAddDataset} />
          </Card>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  datasets: state.data.datasets
});

const mapDispatchToProps = (dispatch: Dispatch<IRootState>) => ({
  onAddDataset: (name: string) => {
    const dataset = new Dataset(name);

    dispatch(actions.add(dataset, name));
  }
});

export default withPageHeaderHoC({ title: 'Data' })(
  connect(mapStateToProps, mapDispatchToProps)(DataPage)
);
