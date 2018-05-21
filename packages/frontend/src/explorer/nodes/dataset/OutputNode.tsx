import * as React from 'react';
import { Form, Input } from 'antd';

import { ClientNodeDef } from '../AllNodes';
import {
  getOrDefault,
  formToMap,
  DatasetOutputNodeDef,
  DatasetOutputNodeInputs
} from '@masterthesis/shared';

export const DatasetOutputNode: ClientNodeDef<DatasetOutputNodeInputs, {}> = {
  name: DatasetOutputNodeDef.name,
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form.Item label="Name">
      {getFieldDecorator('name', {
        rules: [{ required: true }],
        initialValue: getOrDefault<string>(formToMap(form), 'name', '')
      })(<Input />)}
    </Form.Item>
  )
};
