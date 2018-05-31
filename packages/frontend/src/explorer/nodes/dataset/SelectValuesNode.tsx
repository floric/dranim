import * as React from 'react';

import {
  SelectValuesNodeDef,
  SelectValuesNodeForm,
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs
} from '@masterthesis/shared';
import { Form, Select } from 'antd';

import { ClientNodeDef } from '../AllNodes';
import { getValueOrDefault } from '../utils';

export const SelectValuesNode: ClientNodeDef<
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  SelectValuesNodeForm
> = {
  name: SelectValuesNodeDef.name,
  onClientExecution: (inputs, nodeForm, context) => {
    const validInput = inputs.dataset;
    if (!validInput || !validInput.isPresent) {
      return {
        dataset: {
          content: {
            schema: []
          },
          isPresent: false
        }
      };
    }

    const inputValues = validInput.content.schema;
    const selectedValues = nodeForm.values;

    return {
      dataset: {
        content: {
          schema: selectedValues
            ? inputValues.filter(n => selectedValues.includes(n.name))
            : []
        },
        isPresent: true
      }
    };
  },
  renderFormItems: ({
    form,
    form: { getFieldDecorator },
    nodeForm,
    inputs
  }) => {
    const dsInput = inputs.dataset;
    const options = dsInput.isPresent ? dsInput.content.schema : [];
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
