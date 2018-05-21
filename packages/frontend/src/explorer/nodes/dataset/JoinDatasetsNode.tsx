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
    const schemasA = dsA.content.schema;
    const schemasB = dsB.content.schema;
    return (
      <>
        <Form.Item label="Value from A">
          {getFieldDecorator('valueA', {
            rules: [{ required: true }],
            initialValue: getValueOrDefault(nodeForm, 'valueA', '')
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
            initialValue: getValueOrDefault(nodeForm, 'valueB', '')
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
