import * as React from 'react';
import { InputNumber, Form } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  getOrDefault,
  formToMap,
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
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        rules: [{ required: true, type: 'number' }],
        initialValue: getOrDefault<number>(formToMap(form), 'value', 0)
      })(<InputNumber />)}
    </Form.Item>
  )
};
