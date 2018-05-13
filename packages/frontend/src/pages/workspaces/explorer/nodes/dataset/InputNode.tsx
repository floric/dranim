import * as React from 'react';
import { Form, Select } from 'antd';
import { DataSocket, DATASET_TYPE, OutputSocketInformation } from '../Sockets';
import { getOrDefault } from '../utils';
import { NodeDef } from '../AllNodes';

export const DatasetInputNode: NodeDef = {
  title: 'Dataset Input',
  inputs: [],
  outputs: [DataSocket('Dataset')],
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
    <Form.Item label="Input">
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
            <Select.Option value={ds.id} key={ds.id}>
              {ds.name}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  )
};
