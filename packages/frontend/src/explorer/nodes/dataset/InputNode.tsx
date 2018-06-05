import * as React from 'react';

import {
  DatasetInputNodeDef,
  DatasetInputNodeForm,
  DatasetInputNodeOutputs
} from '@masterthesis/shared';
import { Form, Select } from 'antd';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const DatasetInputNode: ClientNodeDef<
  {},
  DatasetInputNodeOutputs,
  DatasetInputNodeForm
> = {
  name: DatasetInputNodeDef.name,
  renderName: ({ state: { datasets } }, nodeForm) => {
    const ds = datasets.find(n => n.id === nodeForm.dataset);
    return !ds ? DatasetInputNodeDef.name : ds.name;
  },
  renderFormItems: ({
    form: { getFieldDecorator },
    state: { datasets },
    nodeForm
  }) => (
    <Form.Item label="Input">
      {getFieldDecorator('dataset', {
        rules: [{ required: true }],
        initialValue: getValueOrDefault(nodeForm, 'dataset', '')
      })(
        <Select showSearch style={{ width: 200 }} placeholder="Select Dataset">
          {datasets.map(ds => (
            <Select.Option value={ds.id} key={ds.id}>
              {ds.name}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  )
};
