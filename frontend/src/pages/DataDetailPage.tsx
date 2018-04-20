import * as React from 'react';
import { Row, Col, Card, Table, Button } from 'antd';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { format } from 'date-fns';
import Exception from 'ant-design-pro/lib/Exception';
import { History } from 'history';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { IRootState } from '../state/reducers/root';
import { Dataset } from '../model/dataset';
import { SFC } from 'react';

export interface IDataDetailPageProps
  extends RouteComponentProps<{ id: string }> {
  dataset: Dataset | undefined;
}

const NoDatasetExceptionActions: SFC<{ history: History }> = ({ history }) => (
  <Button type="primary" onClick={() => history.push('/data')}>
    Create new Dataset
  </Button>
);

class DataDetailPage extends React.Component<IDataDetailPageProps> {
  public render() {
    const {
      dataset,
      history,
      match: {
        params: { id }
      }
    } = this.props;
    if (!dataset) {
      return (
        <Card>
          <Exception
            type="404"
            title="Unknown Dataset"
            desc={`The dataset with id '${id}' doesn't exist.`}
            actions={<NoDatasetExceptionActions history={history} />}
          />
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
