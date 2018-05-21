import * as React from 'react';
import { Form, Select } from 'antd';
import { getValidInput } from '../utils';
import { ClientNodeDef } from '../AllNodes';
import {
  getOrDefault,
  formToMap,
  DataType,
  JoinDatasetsNodeDef,
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs
} from '@masterthesis/shared';

export const JoinDatasetsNode: ClientNodeDef<
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs
> = {
  name: JoinDatasetsNodeDef.name,
  onClientExecution: (inputs, context) => {
    const validInputA = getValidInput(inputs.datasetA);
    const validInputB = getValidInput(inputs.datasetB);
    if (!validInputA || !validInputB) {
      return {
        joined: { dataType: DataType.DATASET, isPresent: false }
      };
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
        ['Joined', { dataType: DataType.DATASET, isPresent: false }]
      ]);
    }

    const isIdPresentInInputs =
      inputValuesA.includes(idValue) && inputValuesB.includes(idValue);
    if (!isIdPresentInInputs) {
      return new Map<string, OutputSocketInformation>([
        ['Joined', { dataType: DataType.DATASET, isPresent: false }]
      ]);
    }

    const allSchemas = new Set(inputValuesA.concat(inputValuesB));
    return new Map<string, OutputSocketInformation>([
      [
        'Joined',
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
    inputs,
    node: { form },
    form: { getFieldDecorator },
    state: { datasets }
  }) => {
    const dsA = inputs.get('Dataset A');
    const dsB = inputs.get('Dataset B');
    if (!dsA || !dsB || !dsA.isPresent || !dsB.isPresent) {
      return <p>Plugin the two datasets first.</p>;
    }
    const schemasA = dsA.meta!.find(n => n.name === 'schemas')
      ? dsA.meta!.find(n => n.name === 'schemas').info
      : [];
    const schemasB = dsB.meta!.find(n => n.name === 'schemas')
      ? dsB.meta!.find(n => n.name === 'schemas').info
      : [];

    return (
      <>
        <Form.Item label="Value from A">
          {getFieldDecorator('valueA', {
            rules: [{ required: true }],
            initialValue: getOrDefault<string>(formToMap(form), 'valueA', '')
          })(
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Select Value"
            >
              {schemasA.map(ds => (
                <Select.Option value={ds} key={ds}>
                  {ds}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="Value from B">
          {getFieldDecorator('valueB', {
            rules: [{ required: true }],
            initialValue: getOrDefault<string>(formToMap(form), 'valueB', '')
          })(
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Select Value"
            >
              {schemasB.map(ds => (
                <Select.Option value={ds} key={ds}>
                  {ds}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </>
    );
  }
};
