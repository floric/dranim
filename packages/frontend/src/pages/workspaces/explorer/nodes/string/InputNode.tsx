import * as React from 'react';
import { Input, Form } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  getOrDefault,
  formToMap,
  StringInputNodeDef
} from '@masterthesis/shared';

export const StringInputNode: ClientNodeDef = {
  name: StringInputNodeDef.name,
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: getOrDefault<string>(formToMap(form), 'value', '')
      })(<Input />)}
    </Form.Item>
  )
};
