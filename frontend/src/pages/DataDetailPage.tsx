import * as React from 'react';
import { Row, Col, Card, Table } from 'antd';
import { connect } from 'react-redux';
import { format } from 'date-fns';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { IRootState } from '../state/reducers/root';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dataset } from '../model/dataset';

export interface IDataDetailPageProps
  extends RouteComponentProps<{ id: string }> {
  dataset: Dataset | undefined;
}

class DataDetailPage extends React.Component<IDataDetailPageProps> {
  public render() {
    const {
      dataset,
      match: {
        params: { id }
      }
    } = this.props;
    if (!dataset) {
      return (
        <Card>
          <p>
            No data imported yet for <b>{id}</b> dataset.
          </p>
        </Card>
      );
    }

    const dataSource = dataset.entries.map(e => ({
      time: format(e.time, 'MM/DD/YYYY'),
      key: e.id,
      values: e.values.size
    }));

    const columns = [
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
        <Col>
          <Card>
            <Table dataSource={dataSource} columns={columns} />
          </Card>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (
  state: IRootState,
  props: RouteComponentProps<{ id: string }>
) => ({
  dataset: state.data.datasets.get(props.match.params.id)
});

export default withPageHeaderHoC({ title: 'Datadetails' })(
  withRouter(connect(mapStateToProps)(DataDetailPage))
);
