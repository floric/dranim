import * as React from 'react';
import { Form, Select } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  getOrDefault,
  formToMap,
  DatasetInputNodeDef,
  DatasetInputNodeOutputs
} from '@masterthesis/shared';

export const DatasetInputNode: ClientNodeDef<{}, DatasetInputNodeOutputs> = {
  name: DatasetInputNodeDef.name,
  onClientExecution: (inputs, context) => {
    const dsId = getOrDefault<string | null>(
      formToMap(context.node.form),
      'dataset',
      null
    );
    if (!dsId) {
      return {
        dataset: {
          isPresent: false,
          content: {
            schema: []
          }
        }
      };
    }
    const ds = context.state.datasets.find(n => n.id === dsId);
    if (!ds) {
      return {
        dataset: {
          isPresent: false,
          content: {
            schema: []
          }
        }
      };
    }

    return {
      dataset: {
        isPresent: true,
        content: {
          schema: ds.valueschemas.map(n => n.name)
        }
      }
    };
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
