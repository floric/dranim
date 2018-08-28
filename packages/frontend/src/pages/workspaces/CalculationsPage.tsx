import {
  CalculationProcess,
  GQLCalculationProcess,
  ProcessState
} from '@masterthesis/shared';
import { Card, Col, Icon, Row, Table, Tooltip } from 'antd';
import gql from 'graphql-tag';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { HandledQuery } from '../../components/HandledQuery';
import { ProcessTime } from '../../components/ProcessTime';

const CALCULATIONS = gql`
  query calculations($workspaceId: String!) {
    calculations(workspaceId: $workspaceId) {
      id
      start
      finish
      state
      processedOutputs
      totalOutputs
    }
  }
`;

const calculationsToDatasource = (calculations: Array<CalculationProcess>) =>
  calculations
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
    .map(e => ({
      key: e.id,
      time: { start: e.start, finish: e.finish },
      state: (
        <Tooltip title={e.state.toLowerCase()}>
          {e.state === ProcessState.SUCCESSFUL ? (
            <Icon type="check-circle" />
          ) : e.state === ProcessState.PROCESSING ? (
            <Icon type="clock-circle" />
          ) : (
            <Icon type="exclamation-circle" />
          )}
        </Tooltip>
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
    render: time => <ProcessTime start={time.start} finish={time.finish} />
  },
  {
    title: 'Results',
    dataIndex: 'results',
    key: 'results',
    render: u => (
      <Row>
        <Col xs={8}>{`${u.processed} Processed`}</Col>
        <Col xs={8}>{`${u.total} Total`}</Col>
      </Row>
    )
  }
];

export interface WorkspaceCalculationsPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

export const WorkspaceCalculationsPage: React.SFC<
  WorkspaceCalculationsPageProps
> = ({
  match: {
    params: { workspaceId }
  }
}) => (
  <HandledQuery<
    { calculations: Array<GQLCalculationProcess> },
    { workspaceId: string }
  >
    query={CALCULATIONS}
    variables={{ workspaceId }}
  >
    {({ data: { calculations } }) => {
      const schemasDataSource = calculationsToDatasource(
        Array.from(calculations)
      );

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
  </HandledQuery>
);
