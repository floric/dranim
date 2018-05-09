import * as React from 'react';
import { Component } from 'react';
import gql from 'graphql-tag';
import { Row, Col, Card, Table, Icon } from 'antd';
import { Query } from 'react-apollo';
import NumberInfo from 'ant-design-pro/lib/NumberInfo';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { LoadingCard, UnknownErrorCard } from '../components/CustomCards';
import { ProcessTime } from '../components/ProcessTime';

export enum CalculationProcessState {
  STARTED = 'STARTED',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
  SUCCESSFUL = 'SUCCESSFUL'
}

export interface CalculationProcess {
  id: string;
  start: string;
  finish: string | null;
  processedOutputs: number;
  totalOutputs: number;
  state: CalculationProcessState;
}

const CALCULATIONS = gql`
  {
    calculations {
      id
      start
      finish
      state
      processedOutputs
      totalOutputs
    }
  }
`;

class CalculationProcessesPage extends Component<{}> {
  public render() {
    return (
      <Query query={CALCULATIONS}>
        {({ loading, error, data, refetch }) => {
          if (loading) {
            return <LoadingCard />;
          }

          if (error) {
            return <UnknownErrorCard error={error} />;
          }

          const calculations: Array<CalculationProcess> = data.calculations;

          const schemasDataSource = calculations.map(e => ({
            key: e.id,
            time: { start: e.start, finish: e.finish },
            state:
              e.state === CalculationProcessState.SUCCESSFUL ? (
                <Icon type="check-circle" />
              ) : e.state === CalculationProcessState.PROCESSING ? (
                <Icon type="clock-circle" />
              ) : (
                <Icon type="warning-circle" />
              ),
            results: {
              processed: e.processedOutputs.toLocaleString(),
              total: e.totalOutputs.toLocaleString()
            }
          }));

          const schemasColumns = [
            {
              title: 'State',
              dataIndex: 'state',
              key: 'state'
            },
            {
              title: 'Time',
              dataIndex: 'time',
              key: 'time',
              render: time => (
                <ProcessTime start={time.start} finish={time.finish} />
              )
            },
            {
              title: 'Results',
              dataIndex: 'results',
              key: 'results',
              render: u => (
                <Row>
                  <Col xs={8}>
                    <NumberInfo gap={0} title="Processed" total={u.processed} />
                  </Col>
                  <Col xs={8}>
                    <NumberInfo gap={0} title="Total" total={u.total} />
                  </Col>
                </Row>
              )
            }
          ];

          return (
            <Row>
              <Col>
                <Card bordered={false}>
                  <Table
                    bordered={false}
                    size="small"
                    pagination={false}
                    dataSource={schemasDataSource}
                    columns={schemasColumns}
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
  title: 'Calculations',
  size: 'small',
  includeInCard: false
})(CalculationProcessesPage);
