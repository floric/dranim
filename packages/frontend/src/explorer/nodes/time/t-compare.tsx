import {
  DatetimeCompareNodeDef,
  DatetimeCompareNodeInputs,
  DatetimeCompareNodeOutputs,
  TimeComparisonNodeForm
} from '@masterthesis/shared';

import { ClientNodeDef } from '../all-nodes';
import {
  renderTimeComparisonForm,
  renderTimeComparisonName
} from '../datetime/dt-compare';

export const TimeComparisonNode: ClientNodeDef<
  DatetimeCompareNodeInputs,
  DatetimeCompareNodeOutputs,
  TimeComparisonNodeForm
> = {
  type: DatetimeCompareNodeDef.type,
  renderName: renderTimeComparisonName,
  renderFormItems: renderTimeComparisonForm
};
