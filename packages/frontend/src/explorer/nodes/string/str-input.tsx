import * as React from 'react';

import {
  StringInputNodeDef,
  StringInputNodeForm,
  StringInputNodeOutputs
} from '@masterthesis/shared';
import { Form, Input } from 'antd';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const StringInputNode: ClientNodeDef<
  {},
  StringInputNodeOutputs,
  StringInputNodeForm
> = {
  name: StringInputNodeDef.name,
  renderName: (context, nodeForm) =>
    nodeForm.value == null ? StringInputNodeDef.name : nodeForm.value,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: getValueOrDefault(nodeForm, 'value', '')
      })(<Input />)}
    </Form.Item>
  )
};
