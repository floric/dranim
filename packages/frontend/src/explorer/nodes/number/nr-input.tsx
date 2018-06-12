import * as React from 'react';

import {
  NumberInputNodeDef,
  NumberInputNodeForm,
  NumberInputNodeOutputs
} from '@masterthesis/shared';
import { Form, InputNumber } from 'antd';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const NumberInputNode: ClientNodeDef<
  {},
  NumberInputNodeOutputs,
  NumberInputNodeForm
> = {
  type: NumberInputNodeDef.type,
  renderName: (context, nodeForm) =>
    nodeForm.value == null
      ? NumberInputNodeDef.name
      : nodeForm.value.toString(),
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        rules: [{ required: true, type: 'number' }],
        initialValue: getValueOrDefault(nodeForm, 'value', 0)
      })(<InputNumber />)}
    </Form.Item>
  )
};
