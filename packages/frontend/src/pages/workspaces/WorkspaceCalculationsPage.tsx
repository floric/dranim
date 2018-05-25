import * as React from 'react';

import { CalculationProcess, ProcessState } from '@masterthesis/shared';
import { Card, Col, Icon, Row, Table } from 'antd';
import gql from 'graphql-tag';
import { Component } from 'react';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';

import { LoadingCard, UnknownErrorCard } from '../../components/CustomCards';
import { NumberInfo } from '../../components/NumberInfo';
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

export interface IWorkspaceCalculationsPageProps
  extends RouteComponentProps<{ id: string }> {}

export default class WorkspaceCalculationsPage extends Component<
  IWorkspaceCalculationsPageProps
> {
  public render() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    return (
      <Query query={CALCULATIONS} variables={{ workspaceId: id }}>
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
              e.state === ProcessState.SUCCESSFUL ? (
                <Icon type="check-circle" />
              ) : e.state === ProcessState.PROCESSING ? (
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
                    <NumberInfo title="Processed" total={u.processed} />
                  </Col>
                  <Col xs={8}>
                    <NumberInfo title="Total" total={u.total} />
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
