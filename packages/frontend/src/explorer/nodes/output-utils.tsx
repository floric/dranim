import * as React from 'react';

import { Form, Input } from 'antd';

import { RenderFormItemsProps } from './all-nodes';
import { getValueOrDefault } from './utils';

export const createRenderOutputFormItems = (
  renderFormItems?: (props: RenderFormItemsProps<any, any>) => JSX.Element
) => (
  props: RenderFormItemsProps<
    any,
    {
      name: string;
      description: string;
    }
  >
) => {
  const {
    form: { getFieldDecorator },
    nodeForm
  } = props;
  console.log(nodeForm);
  return (
    <>
      <h4>Output</h4>
      <Form.Item label="Name">
        {getFieldDecorator('name', {
          initialValue: getValueOrDefault(nodeForm, 'name', ''),
          rules: [{ required: true }]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="Description">
        {getFieldDecorator('description', {
          initialValue: getValueOrDefault(nodeForm, 'description', '')
        })(<Input.TextArea />)}
      </Form.Item>
      {renderFormItems ? (
        <>
          <h4>Properties</h4>
          {renderFormItems(props)}
        </>
      ) : null}
    </>
  );
};
