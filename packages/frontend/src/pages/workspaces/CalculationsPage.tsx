import React, { SFC } from 'react';

import {
  CalculationProcess,
  GQLCalculationProcess,
  ProcessState
} from '@masterthesis/shared';
import { Card, Col, Icon, Row, Table, Tooltip } from 'antd';
import gql from 'graphql-tag';
import { RouteComponentProps } from 'react-router-dom';

import { HandledQuery } from '../../components/HandledQuery';
import { ProcessTime } from '../../components/ProcessTime';

const CALCULATIONS = gql`
  query calculations($workspaceId: ID!) {
    calculations(workspaceId: $workspaceId) {
      id
      start
      finish
      state
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
      )
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
  }
];

export interface WorkspaceCalculationsPageProps
  extends RouteComponentProps<{ workspaceId: string }> {}

const WorkspaceCalculationsPage: SFC<WorkspaceCalculationsPageProps> = ({
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

export default WorkspaceCalculationsPage;
