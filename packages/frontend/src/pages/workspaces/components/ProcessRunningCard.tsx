import React, { SFC } from 'react';

import { CalculationProcess } from '@masterthesis/shared';
import moment from 'moment';
import { Mutation } from 'react-apollo';

import { AsyncButton } from '../../../components/AsyncButton';
import { LoadingCard } from '../../../components/layout/CustomCards';
import { STOP_CALCULATION } from '../../../graphql/editor-page';

export const ProcessRunningCard: SFC<{
  currentCalculation: CalculationProcess;
}> = ({ currentCalculation }) => (
  <Mutation mutation={STOP_CALCULATION}>
    {stopCalculation => (
      <LoadingCard text="Calculation in progress...">
        <p>
          {`Processed ${currentCalculation.processedOutputs} of ${
            currentCalculation.totalOutputs
          } nodes | Started ${moment(currentCalculation.start).toNow()}`}
        </p>
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
      </LoadingCard>
    )}
  </Mutation>
);
