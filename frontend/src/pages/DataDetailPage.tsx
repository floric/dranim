import * as React from 'react';
import { Row, Col, Card, Button, Table } from 'antd';
import { connect } from 'react-redux';
import { format } from 'date-fns';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { actions } from '../state/actions/data';
import { Dispatch } from 'redux';
import { Entry } from '../model/entry';
import { Value } from '../model/value';
import { IRootState } from '../state/reducers/root';
import { RouteComponentProps } from 'react-router-dom';

export interface IDataDetailPageProps
  extends RouteComponentProps<{ id: string }> {
  entries: ReadonlyArray<Entry>;
  onAddEntry: () => void;
}

class DataDetailPage extends React.Component<IDataDetailPageProps> {
  private handleClick = () => this.props.onAddEntry();

  public render() {
    const dataSource = this.props.entries.map(e => ({
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
          <Card bordered={false}>
            <Button onClick={this.handleClick}>Click me</Button>
          </Card>
          <Card>
            <Table dataSource={dataSource} columns={columns} />
          </Card>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state: IRootState) => ({
  entries: state.data.entries
});

const mapDispatchToProps = (dispatch: Dispatch<IRootState>) => ({
  onAddEntry: () => {
    const newEntry = new Entry();
    newEntry.addVal(new Value<number>('testA', 9.9));
    dispatch(actions.add(newEntry));
  }
});

export default withPageHeaderHoC({ title: 'Datadetails' })(
  connect(mapStateToProps, mapDispatchToProps)(DataDetailPage)
);
