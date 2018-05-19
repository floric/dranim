import * as React from 'react';
import { Form, Select } from 'antd';
import { OutputSocketInformation } from '../Sockets';
import { ClientNodeDef } from '../AllNodes';
import {
  DataType,
  getOrDefault,
  formToMap,
  DatasetInputNodeDef
} from '@masterthesis/shared';

export const DatasetInputNode: ClientNodeDef = {
  name: DatasetInputNodeDef.name,
  onClientExecution: (inputs, context) => {
    const dsId = getOrDefault<string | null>(
      formToMap(context.node.form),
      'dataset',
      null
    );
    if (!dsId) {
      return new Map<string, OutputSocketInformation>([
        ['Dataset', { dataType: DataType.DATASET, isPresent: false }]
      ]);
    }
    const ds = context.state.datasets.find(n => n.id === dsId);
    if (!ds) {
      return new Map<string, OutputSocketInformation>([
        ['Dataset', { dataType: DataType.DATASET, isPresent: false }]
      ]);
    }

    return new Map<string, OutputSocketInformation>([
      [
        'Dataset',
        {
          dataType: DataType.DATASET,
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
          formToMap(form),
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
