import * as React from 'react';
import { Form, Select } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  SelectValuesNodeDef,
  SelectValuesNodeForm
} from '@masterthesis/shared';
import { getValueOrDefault } from '../utils';

export const DatasetSelectValuesNode: ClientNodeDef<
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
            ? inputValues.filter(n => selectedValues.includes(n))
            : []
        },
        isPresent: true
      }
    };
  },
  renderFormItems: ({
    form,
    form: { getFieldDecorator },
    state: { datasets, connections, nodes },
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
            style={{ width: 200 }}
            placeholder="Select Values"
          >
            {options.map(c => <Select.Option key={c}>{c}</Select.Option>)}
          </Select>
        )}
      </Form.Item>
    );
  }
};
