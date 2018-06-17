import * as React from 'react';

import {
  DatetimeInputNodeDef,
  DatetimeInputNodeOutputs,
  DatetimeInputNodeForm
} from '@masterthesis/shared';
import { Form, DatePicker } from 'antd';
import * as moment from 'moment';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const TimeInputNode: ClientNodeDef<
  {},
  DatetimeInputNodeOutputs,
  DatetimeInputNodeForm
> = {
  type: DatetimeInputNodeDef.type,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: moment(getValueOrDefault(nodeForm, 'value', new Date()))
      })(<DatePicker showTime={true} />)}
    </Form.Item>
  )
};
