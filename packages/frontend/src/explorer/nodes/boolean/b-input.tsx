import React from 'react';

import {
  BooleanInputNodeDef,
  BooleanInputNodeForm,
  BooleanInputNodeOutputs
} from '@masterthesis/shared';
import { Checkbox, Form } from 'antd';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const BooleanInputNode: ClientNodeDef<
  {},
  BooleanInputNodeOutputs,
  BooleanInputNodeForm
> = {
  type: BooleanInputNodeDef.type,
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => {
    const value = getValueOrDefault(nodeForm, 'value', false);
    return (
      <Form.Item label="Value">
        {getFieldDecorator('value', {
          initialValue: value
        })(<Checkbox defaultChecked={value} />)}
      </Form.Item>
    );
  }
};
