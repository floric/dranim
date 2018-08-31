import React from 'react';

import {
  SelectValuesNodeDef,
  SelectValuesNodeForm,
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs
} from '@masterthesis/shared';
import { Alert, Form, Select } from 'antd';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const SelectValuesNode: ClientNodeDef<
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  SelectValuesNodeForm
> = {
  type: SelectValuesNodeDef.type,
  renderFormItems: ({
    form: { getFieldDecorator },
    nodeForm,
    inputs: { dataset }
  }) => {
    if (!dataset || !dataset.isPresent) {
      return (
        <Alert
          message="Dataset required"
          description="Please input a valid Dataset."
          type="warning"
          showIcon
        />
      );
    }

    const options = dataset.isPresent ? dataset.content.schema : [];
    return (
      <Form.Item label="Input">
        {getFieldDecorator('values', {
          initialValue: getValueOrDefault(nodeForm, 'values', [])
        })(
          <Select
            mode="multiple"
            showSearch
            style={{ width: 200 }}
            placeholder="Select values"
          >
            {options.map(o => (
              <Select.Option value={o.name} key={o.name}>
                {o.name}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
    );
  }
};
