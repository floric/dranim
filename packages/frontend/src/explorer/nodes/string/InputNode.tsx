import {
  StringInputNodeDef,
  StringInputNodeForm,
  StringInputNodeOutputs
} from '@masterthesis/shared';
import { Form, Input } from 'antd';
import * as React from 'react';

import { ClientNodeDef } from '../AllNodes';
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
