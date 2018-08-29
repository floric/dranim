import { CalculationProcess } from '@masterthesis/shared';
import { distanceInWordsToNow } from 'date-fns';
import * as React from 'react';
import { Mutation } from 'react-apollo';

import { AsyncButton } from '../../../components/AsyncButton';
import { LoadingCard } from '../../../components/CustomCards';
import { STOP_CALCULATION } from '../../../graphql/editor-page';
import { showNotificationWithIcon } from '../../../utils/form';

export const ProcessRunningCard: React.SFC<{
  currentCalculation: CalculationProcess;
}> = ({ currentCalculation }) => (
  <Mutation mutation={STOP_CALCULATION}>
    {stopCalculation => (
      <LoadingCard text="Calculation in progress...">
        <p>
          {`Processed ${currentCalculation.processedOutputs} of ${
            currentCalculation.totalOutputs
          } nodes | Started ${distanceInWordsToNow(currentCalculation.start, {
            includeSeconds: true,
            addSuffix: true
          })}`}
        </p>
        <AsyncButton
          type="danger"
          icon="close"
          fullWidth={false}
          onClick={async () => {
            await stopCalculation({
              variables: { id: currentCalculation.id }
            });
            showNotificationWithIcon({
              icon: 'info',
              title: 'Calculation will be stopped',
              content: 'Please wait until the calculation has been stopped'
            });
          }}
        >
          Stop Calculation
        </AsyncButton>
      </LoadingCard>
    )}
  </Mutation>
);
