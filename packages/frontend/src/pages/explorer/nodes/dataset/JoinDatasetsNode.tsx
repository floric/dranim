import * as React from 'react';
import { Form, Select } from 'antd';
import { DataSocket, DATASET_TYPE, OutputSocketInformation } from '../Sockets';
import { getOrDefault, getValidInput } from '../utils';
import { NodeOptions } from '../AllNodes';

const FormItem = Form.Item;
const Option = Select.Option;

export const JoinDatasetsNode: NodeOptions = {
  title: 'Join Datasets',
  inputs: [DataSocket('Dataset A', 'input'), DataSocket('Dataset B', 'input')],
  outputs: [DataSocket('Combined', 'output')],
  onClientExecution: (inputs, context) => {
    const validInputA = getValidInput('Dataset A', inputs);
    const validInputB = getValidInput('Dataset B', inputs);
    if (!validInputA || !validInputB) {
      return new Map<string, OutputSocketInformation>([
        ['Combined', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }

    const inputValuesA = validInputA.meta
      ? validInputA.meta.filter(m => m.name === 'schema').map(s => s.info)
      : [];
    const inputValuesB = validInputB.meta
      ? validInputB.meta.filter(m => m.name === 'schema').map(s => s.info)
      : [];

    const idValue = getOrDefault<string | null>(
      context.node.form,
      'value',
      null
    );

    if (!idValue) {
      return new Map<string, OutputSocketInformation>([
        ['Combined', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }

    const isIdPresentInInputs =
      inputValuesA.includes(idValue) && inputValuesB.includes(idValue);
    if (!isIdPresentInInputs) {
      return new Map<string, OutputSocketInformation>([
        ['Combined', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }

    const allSchemas = new Set(inputValuesA.concat(inputValuesB));
    return new Map<string, OutputSocketInformation>([
      [
        'Dataset',
        {
          dataType: DATASET_TYPE,
          meta: [
            {
              name: 'schemas',
              info: Array.from(allSchemas)
            }
          ]
        }
      ]
    ]);
  },
  path: ['Dataset', 'Aggregators'],
  keywords: [],
  form: ({ form: { getFieldDecorator }, state: { datasets } }) => {
    return (
      <Form layout="inline" hideRequiredMark>
        <FormItem label="Input">
          {getFieldDecorator('value', {
            rules: [{ required: true }]
          })(
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Select ID Value"
            >
              {datasets.map(ds => (
                <Option value={ds.id} key={ds.id}>
                  {ds.name}
                </Option>
              ))}
            </Select>
          )}
        </FormItem>
      </Form>
    );
  }
};
