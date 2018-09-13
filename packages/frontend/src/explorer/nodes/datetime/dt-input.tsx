import React from 'react';

import {
  DatetimeInputNodeDef,
  DatetimeInputNodeForm,
  DatetimeInputNodeOutputs
} from '@masterthesis/shared';
import { DatePicker, Form } from 'antd';
import moment from 'moment';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const DatetimeInputNode: ClientNodeDef<
  {},
  DatetimeInputNodeOutputs,
  DatetimeInputNodeForm
> = {
  type: DatetimeInputNodeDef.type,
  renderName: (context, nodeForm) =>
    moment(nodeForm.value != null ? nodeForm.value : new Date()).format('LLL'),
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: moment(
          getValueOrDefault(nodeForm, 'value', new Date().toISOString())
        )
      })(<DatePicker showTime={true} />)}
    </Form.Item>
  )
};
