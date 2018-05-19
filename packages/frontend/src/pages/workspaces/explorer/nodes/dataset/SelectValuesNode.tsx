import * as React from 'react';
import { Form, Select } from 'antd';
import { DATASET_TYPE, OutputSocketInformation } from '../Sockets';
import { getValidInput } from '../utils';
import { ClientNodeDef } from '../AllNodes';
import { getOrDefault, formToMap } from '@masterthesis/shared';

export const DatasetSelectValuesNode: ClientNodeDef = {
  title: 'Select Values',
  onClientExecution: (inputs, context) => {
    const validInput = getValidInput('Dataset', inputs);
    if (!validInput) {
      return new Map<string, OutputSocketInformation>([
        ['Dataset', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }

    const inputValues = validInput.meta
      ? validInput.meta.filter(m => m.name === 'schemas').map(s => s.info)[0]
      : [];

    const selectedValues = getOrDefault<Array<string>>(
      formToMap(context.node.form),
      'values',
      []
    );

    return new Map<string, OutputSocketInformation>([
      [
        'Dataset',
        {
          dataType: DATASET_TYPE,
          meta: [
            {
              name: 'schemas',
              info: selectedValues
                ? inputValues.filter(n => selectedValues.includes(n))
                : []
            }
          ]
        }
      ]
    ]);
  },
  renderFormItems: ({
    form,
    form: { getFieldDecorator },
    state: { datasets, connections, nodes },
    node,
    node: { id, type },
    inputs
  }) => {
    const dsInput = inputs.get('Dataset');
    const metaValues =
      dsInput && dsInput.isPresent !== false && dsInput.meta
        ? dsInput.meta.find(m => m.name === 'schemas') || null
        : null;
    const options = metaValues ? metaValues.info : [];
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
