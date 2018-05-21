import * as React from 'react';
import { InputNumber, Form } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  NumberInputNodeDef,
  NumberInputNodeOutputs,
  NumberInputNodeForm
} from '@masterthesis/shared';

export const NumberInputNode: ClientNodeDef<
  {},
  NumberInputNodeOutputs,
  NumberInputNodeForm
> = {
  name: NumberInputNodeDef.name,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        rules: [{ required: true, type: 'number' }],
        initialValue: nodeForm.value || 0
      })(<InputNumber />)}
    </Form.Item>
  )
};
