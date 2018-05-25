import {
  DatasetInputNodeDef,
  DatasetInputNodeForm,
  DatasetInputNodeOutputs
} from '@masterthesis/shared';
import { Form } from 'antd';
import * as React from 'react';
import { FormSelect } from '../../utils/form-utils';
import { ClientNodeDef } from '../AllNodes';
import { getValueOrDefault } from '../utils';

export const DatasetInputNode: ClientNodeDef<
  {},
  DatasetInputNodeOutputs,
  DatasetInputNodeForm
> = {
  name: DatasetInputNodeDef.name,
  onClientExecution: (inputs, nodeForm, context) => {
    const dsId = nodeForm.dataset;
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
    nodeForm
  }) => (
    <Form.Item label="Input">
      {getFieldDecorator('dataset', {
        rules: [{ required: true }],
        initialValue: getValueOrDefault(nodeForm, 'dataset', '')
      })(
        <FormSelect
          values={datasets.map(n => ({ key: n.id, name: n.name }))}
          placeholder="Select Dataset"
        />
      )}
    </Form.Item>
  )
};
