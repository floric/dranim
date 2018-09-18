import React, { SFC } from 'react';

import { CalculationProcess, GQLNodeInstance } from '@masterthesis/shared';
import { Card, Progress } from 'antd';
import moment from 'moment';
import { Mutation } from 'react-apollo';

import { AsyncButton } from '../../../components/AsyncButton';
import { STOP_CALCULATION } from '../../../graphql/editor-page';

type ProcessRunningCardProps = {
  currentCalculation: CalculationProcess;
  nodes: Array<GQLNodeInstance>;
};

const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

export const ProcessRunningCard: SFC<ProcessRunningCardProps> = ({
  currentCalculation,
  nodes
}) => {
  const rootNodes = nodes.filter(n => n.contextIds.length === 0);

  return (
    <Mutation mutation={STOP_CALCULATION}>
      {stopCalculation => (
        <Card bordered={false} style={{ textAlign: 'center' }}>
          <Progress
            format={formatPercentage}
            percent={
              rootNodes.map(n => n.progress || 0).reduce((a, b) => a + b, 0) /
              rootNodes.length
            }
          />
          <p>{`Started ${moment(currentCalculation.start).fromNow()}`}</p>
          <AsyncButton
            type="danger"
            icon="close"
            fullWidth={false}
            onClick={() =>
              stopCalculation({
                variables: { id: currentCalculation.id }
              })
            }
          >
            Stop Calculation
          </AsyncButton>
        </Card>
      )}
    </Mutation>
  );
};
