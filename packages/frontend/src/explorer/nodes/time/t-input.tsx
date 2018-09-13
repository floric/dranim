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
  renderName: (context, nodeForm) =>
    moment(nodeForm.value != null ? nodeForm.value : new Date()).format('LTS'),
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: moment(
          getValueOrDefault(nodeForm, 'value', new Date().toISOString())
        )
      })(<TimePicker />)}
    </Form.Item>
  )
};
