import * as React from 'react';
import { Form, Select } from 'antd';
import { DataSocket, DATASET_TYPE, OutputSocketInformation } from '../Sockets';
import { getOrDefault, getValidInput } from '../utils';
import { NodeOptions } from '../AllNodes';

const FormItem = Form.Item;
const Option = Select.Option;

export const DatasetSelectValuesNode: NodeOptions = {
  title: 'Select Values',
  inputs: [DataSocket('Dataset', 'input')],
  outputs: [DataSocket('Dataset', 'output')],
  path: ['Dataset', 'Filters'],
  keywords: [],
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
      context.node.form,
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
  form: ({
    form: { getFieldDecorator },
    state: { datasets, connections, nodes },
    node: { id, type, form },
    inputs
  }) => {
    const dsInput = inputs.get('Dataset');
    const metaValues =
      dsInput && dsInput.isPresent !== false && dsInput.meta
        ? dsInput.meta.find(m => m.name === 'schemas') || null
        : null;
    const options = metaValues ? metaValues.info : [];
    return (
      <Form layout="inline">
        <FormItem label="Input">
          {getFieldDecorator('values', {
            initialValue: getOrDefault<Array<string>>(form, 'values', [])
          })(
            <Select
              mode="multiple"
              style={{ width: 200 }}
              placeholder="Select Values"
            >
              {options.map(c => <Option key={c}>{c}</Option>)}
            </Select>
          )}
        </FormItem>
      </Form>
    );
  }
};
