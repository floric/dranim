import React from 'react';

import {
  TimeInputNodeDef,
  TimeInputNodeForm,
  TimeInputNodeOutputs
} from '@masterthesis/shared';
import { Form, TimePicker } from 'antd';
import moment from 'moment';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const TimeInputNode: ClientNodeDef<
  {},
  TimeInputNodeOutputs,
  TimeInputNodeForm
> = {
  type: TimeInputNodeDef.type,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: moment(getValueOrDefault(nodeForm, 'value', new Date()))
      })(<TimePicker />)}
    </Form.Item>
  )
};
