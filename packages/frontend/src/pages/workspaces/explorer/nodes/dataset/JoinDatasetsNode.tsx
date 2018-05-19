import * as React from 'react';
import { Form, Select } from 'antd';
import { OutputSocketInformation } from '../Sockets';
import { getValidInput } from '../utils';
import { ClientNodeDef } from '../AllNodes';
import { getOrDefault, formToMap, DataType } from '@masterthesis/shared';

export const JoinDatasetsNode: ClientNodeDef = {
  title: 'Join Datasets',
  onClientExecution: (inputs, context) => {
    const validInputA = getValidInput('Dataset A', inputs);
    const validInputB = getValidInput('Dataset B', inputs);
    if (!validInputA || !validInputB) {
      return new Map<string, OutputSocketInformation>([
        ['Combined', { dataType: DataType.DATASET, isPresent: false }]
      ]);
    }

    const inputValuesA = validInputA.meta
      ? validInputA.meta.filter(m => m.name === 'schema').map(s => s.info)
      : [];
    const inputValuesB = validInputB.meta
      ? validInputB.meta.filter(m => m.name === 'schema').map(s => s.info)
      : [];

    const idValue = getOrDefault<string | null>(
      formToMap(context.node.form),
      'value',
      null
    );

    if (!idValue) {
      return new Map<string, OutputSocketInformation>([
        ['Combined', { dataType: DataType.DATASET, isPresent: false }]
      ]);
    }

    const isIdPresentInInputs =
      inputValuesA.includes(idValue) && inputValuesB.includes(idValue);
    if (!isIdPresentInInputs) {
      return new Map<string, OutputSocketInformation>([
        ['Combined', { dataType: DataType.DATASET, isPresent: false }]
      ]);
    }

    const allSchemas = new Set(inputValuesA.concat(inputValuesB));
    return new Map<string, OutputSocketInformation>([
      [
        'Dataset',
        {
          dataType: DataType.DATASET,
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
  renderFormItems: ({
    form,
    form: { getFieldDecorator },
    state: { datasets }
  }) => {
    return (
      <Form.Item label="Input">
        {getFieldDecorator('value', {
          rules: [{ required: true }]
        })(
          <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select ID Value"
          >
            {datasets.map(ds => (
              <Select.Option value={ds.id} key={ds.id}>
                {ds.name}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
    );
  }
};
