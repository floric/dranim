import * as React from 'react';
import { Form, Select } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  JoinDatasetsNodeDef,
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  JoinDatasetsNodeForm
} from '@masterthesis/shared';
import { getValueOrDefault } from '../utils';
import { FormSelect } from '../../utils/form-utils';

export const JoinDatasetsNode: ClientNodeDef<
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  JoinDatasetsNodeForm
> = {
  name: JoinDatasetsNodeDef.name,
  onClientExecution: (inputs, nodeForm, context) => {
    const validInputA = inputs.datasetA;
    const validInputB = inputs.datasetB;
    if (!validInputA.isPresent || !validInputB.isPresent) {
      return {
        joined: { content: { schema: [] }, isPresent: false }
      };
    }

    const inputValuesA = validInputA.content.schema;
    const inputValuesB = validInputB.content.schema;
    const idAValue = nodeForm.valueA;
    const idBValue = nodeForm.valueB;

    if (!idAValue || !idBValue) {
      return {
        joined: {
          isPresent: false,
          content: {
            schema: []
          }
        }
      };
    }

    const isIdPresentInInputs =
      inputValuesA.includes(idAValue) && inputValuesB.includes(idBValue);
    if (!isIdPresentInInputs) {
      return {
        joined: {
          isPresent: false,
          content: {
            schema: []
          }
        }
      };
    }

    const allSchemas = new Set(inputValuesA.concat(inputValuesB));
    return {
      joined: {
        isPresent: true,
        content: {
          schema: Array.from(allSchemas)
        }
      }
    };
  },
  renderFormItems: ({
    inputs,
    nodeForm,
    form: { getFieldDecorator },
    state: { datasets }
  }) => {
    const dsA = inputs.datasetA;
    const dsB = inputs.datasetB;
    if (!dsA || !dsB || !dsA.isPresent || !dsB.isPresent) {
      return <p>Plugin the two datasets first.</p>;
    }
    const schemasA = dsA.content.schema.map(s => ({ key: s }));
    const schemasB = dsB.content.schema.map(s => ({ key: s }));
    return (
      <>
        <Form.Item label="Value from A">
          {getFieldDecorator('valueA', {
            rules: [{ required: true }],
            initialValue: getValueOrDefault(nodeForm, 'valueA', '')
          })(
            <FormSelect values={schemasA} placeholder="Select first column" />
          )}
        </Form.Item>
        <Form.Item label="Value from B">
          {getFieldDecorator('valueB', {
            rules: [{ required: true }],
            initialValue: getValueOrDefault(nodeForm, 'valueB', '')
          })(
            <FormSelect values={schemasB} placeholder="Select second column" />
          )}
        </Form.Item>
      </>
    );
  }
};
