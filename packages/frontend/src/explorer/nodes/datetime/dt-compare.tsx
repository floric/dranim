import React from 'react';

import {
  DatetimeCompareNodeDef,
  DatetimeCompareNodeInputs,
  DatetimeCompareNodeOutputs,
  TimeComparisonNodeForm,
  TimeComparisonType
} from '@masterthesis/shared';
import { Form, Select } from 'antd';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const TIME_LATER_THAN = 'Later Than';
export const TIME_EARLIER_THAN = 'Earlier Than';
export const TIME_EQUALS = 'Equals';

export const renderTimeComparisonForm: ((
  a: { form: any; nodeForm: { type: string } }
) => JSX.Element) = ({ form: { getFieldDecorator }, nodeForm }) => (
  <Form.Item label="Type">
    {getFieldDecorator('type', {
      initialValue: getValueOrDefault(
        nodeForm,
        'type',
        TimeComparisonType.EQUALS
      )
    })(
      <Select style={{ width: 200 }} placeholder="Type">
        {[
          { type: TimeComparisonType.EQUALS, display: TIME_EQUALS },
          {
            type: TimeComparisonType.EARLIER_THAN,
            display: TIME_EARLIER_THAN
          },
          { type: TimeComparisonType.LATER_THAN, display: TIME_LATER_THAN }
        ].map(o => (
          <Select.Option value={o.type} key={o.type}>
            {o.display}
          </Select.Option>
        ))}
      </Select>
    )}
  </Form.Item>
);

export const renderTimeComparisonName = (context, nodeForm) => {
  if (nodeForm.type === TimeComparisonType.EARLIER_THAN) {
    return TIME_EARLIER_THAN;
  } else if (nodeForm.type === TimeComparisonType.LATER_THAN) {
    return TIME_LATER_THAN;
  }

  return TIME_EQUALS;
};

export const DatetimeComparisonNode: ClientNodeDef<
  DatetimeCompareNodeInputs,
  DatetimeCompareNodeOutputs,
  TimeComparisonNodeForm
> = {
  type: DatetimeCompareNodeDef.type,
  renderName: renderTimeComparisonName,
  renderFormItems: renderTimeComparisonForm
};
