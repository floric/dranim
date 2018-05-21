import * as React from 'react';
import { Form, Select } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  getOrDefault,
  formToMap,
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs,
  SelectValuesNodeDef
} from '@masterthesis/shared';

export const DatasetSelectValuesNode: ClientNodeDef<
  SelectValuesNodeInputs,
  SelectValuesNodeOutputs
> = {
  name: SelectValuesNodeDef.name,
  onClientExecution: (inputs, context) => {
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

    const selectedValues = getOrDefault<Array<string>>(
      formToMap(context.node.form),
      'values',
      []
    );

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
    node,
    node: { id, type },
    inputs
  }) => {
    const dsInput = inputs.dataset;
    const options = dsInput.isPresent ? dsInput.content.schema : [];
    return (
      <Form.Item label="Input">
        {getFieldDecorator('values', {
          initialValue: getOrDefault<Array<string>>(
            formToMap(node.form),
            'values',
            []
          )
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
