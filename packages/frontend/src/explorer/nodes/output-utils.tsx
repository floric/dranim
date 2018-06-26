import * as React from 'react';

import { FormValues, GQLDashboard } from '@masterthesis/shared';
import { Form, Input, Select } from 'antd';

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
    state: { dashboards: Array<GQLDashboard> };
    nodeForm: FormValues<{
      name: string;
      description: string;
      dashboardId: string;
    }>;
  }
) => JSX.Element = ({
  form: { getFieldDecorator },
  nodeForm,
  state: { dashboards }
}) => {
  return (
    <>
      <h4>Dashboard Settings</h4>
      <Form.Item label="Name" {...formItemLayout}>
        {getFieldDecorator('name', {
          initialValue: getValueOrDefault(nodeForm, 'name', ''),
          rules: [{ required: true }]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="Input">
        {getFieldDecorator('dashboardId', {
          rules: [{ required: true }],
          initialValue: getValueOrDefault(nodeForm, 'dashboardId', '')
        })(
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Dashboard"
          >
            {dashboards.map(ds => (
              <Select.Option value={ds.id} key={ds.id}>
                {ds.name}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
      <Form.Item label="Description" {...formItemLayout}>
        {getFieldDecorator('description', {
          initialValue: getValueOrDefault(nodeForm, 'description', '')
        })(<Input.TextArea />)}
      </Form.Item>
    </>
  );
};
