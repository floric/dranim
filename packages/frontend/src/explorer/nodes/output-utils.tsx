import * as React from 'react';

import { FormValues } from '@masterthesis/shared';
import { Form, Input } from 'antd';

import { WrappedFormUtils } from 'antd/lib/form/Form';
import { getValueOrDefault } from './utils';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
};

export const renderOutputFormItems: (
  props: {
    form: WrappedFormUtils;
    nodeForm: FormValues<{
      name: string;
      description: string;
    }>;
  }
) => JSX.Element = ({ form: { getFieldDecorator }, nodeForm }) => {
  return (
    <>
      <h4>Output</h4>
      <Form.Item label="Name" {...formItemLayout}>
        {getFieldDecorator('name', {
          initialValue: getValueOrDefault(nodeForm, 'name', ''),
          rules: [{ required: true }]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="Description" {...formItemLayout}>
        {getFieldDecorator('description', {
          initialValue: getValueOrDefault(nodeForm, 'description', '')
        })(<Input.TextArea />)}
      </Form.Item>
    </>
  );
};
