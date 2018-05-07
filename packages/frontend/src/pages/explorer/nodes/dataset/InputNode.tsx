import * as React from 'react';
import { Form, Select } from 'antd';
import { DataSocket, DATASET_TYPE, OutputSocketInformation } from '../Sockets';
import { getOrDefault } from '../utils';
import { NodeOptions } from '../AllNodes';

const FormItem = Form.Item;
const Option = Select.Option;

export const DatasetInputNode: NodeOptions = {
  title: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset', 'output')],
  path: ['Dataset'],
  keywords: [],
  onClientExecution: (inputs, context) => {
    const dsId = getOrDefault<string | null>(
      context.node.form,
      'dataset',
      null
    );
    if (!dsId) {
      return new Map<string, OutputSocketInformation>([
        ['Dataset', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }
    const ds = context.state.datasets.find(n => n.id === dsId);
    if (!ds) {
      return new Map<string, OutputSocketInformation>([
        ['Dataset', { dataType: DATASET_TYPE, isPresent: false }]
      ]);
    }

    return new Map<string, OutputSocketInformation>([
      [
        'Dataset',
        {
          dataType: DATASET_TYPE,
          meta: [{ name: 'schemas', info: ds.valueschemas.map(n => n.name) }]
        }
      ]
    ]);
  },
  renderFormItems: ({
    form: { getFieldDecorator },
    state: { datasets },
    node: { form }
  }) => (
    <FormItem label="Input">
      {getFieldDecorator('dataset', {
        rules: [{ required: true }],
        initialValue: getOrDefault<string | undefined>(
          form,
          'dataset',
          undefined
        )
      })(
        <Select showSearch style={{ width: 200 }} placeholder="Select Dataset">
          {datasets.map(ds => (
            <Option value={ds.id} key={ds.id}>
              {ds.name}
            </Option>
          ))}
        </Select>
      )}
    </FormItem>
  )
};
