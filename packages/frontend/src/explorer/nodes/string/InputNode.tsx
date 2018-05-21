import * as React from 'react';
import { Input, Form } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  StringInputNodeDef,
  StringInputNodeOutputs,
  StringInputNodeForm
} from '@masterthesis/shared';
import { getValueOrDefault } from '../utils';

export const StringInputNode: ClientNodeDef<
  {},
  StringInputNodeOutputs,
  StringInputNodeForm
> = {
  name: StringInputNodeDef.name,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: getValueOrDefault(nodeForm, 'value', '')
      })(<Input />)}
    </Form.Item>
  )
};
