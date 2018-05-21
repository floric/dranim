import * as React from 'react';
import { Form, Select } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import {
  getOrDefault,
  formToMap,
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
    const validInputA = inputs.datasetA;
    const validInputB = inputs.datasetB;
    if (!validInputA.isPresent || !validInputB.isPresent) {
      return {
        joined: { content: { schema: [] }, isPresent: false }
      };
    }

    const inputValuesA = validInputA.content.schema;
    const inputValuesB = validInputB.content.schema;

    const idValue = getOrDefault<string | null>(
      formToMap(context.node.form),
      'value',
      null
    );

    if (!idValue) {
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
      inputValuesA.includes(idValue) && inputValuesB.includes(idValue);
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
    node: { form },
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
