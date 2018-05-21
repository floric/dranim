import * as React from 'react';
import { Input, Form } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  StringInputNodeDef,
  StringInputNodeOutputs,
  StringInputNodeForm
} from '@masterthesis/shared';

export const StringInputNode: ClientNodeDef<
  {},
  StringInputNodeOutputs,
  StringInputNodeForm
> = {
  name: StringInputNodeDef.name,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: nodeForm.value || ''
      })(<Input />)}
    </Form.Item>
  )
};
