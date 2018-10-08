import React from 'react';

import {
  JoinDatasetsNodeDef,
  JoinDatasetsNodeForm,
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs
} from '@masterthesis/shared';
import { Form, Select } from 'antd';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

export const JoinDatasetsNode: ClientNodeDef<
  JoinDatasetsNodeInputs,
  JoinDatasetsNodeOutputs,
  JoinDatasetsNodeForm
> = {
  type: JoinDatasetsNodeDef.type,
  renderFormItems: ({ inputs, nodeForm, form: { getFieldDecorator } }) => {
    const dsA = inputs.datasetA;
    const dsB = inputs.datasetB;
    if (!dsA || !dsB || !dsA.isPresent || !dsB.isPresent) {
      return <p>Plugin the two Tables at first.</p>;
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
              placeholder="Select first column"
            >
              {schemasA.map(ds => (
                <Select.Option value={ds.name} key={ds.name}>
                  {ds.name}
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
              placeholder="Select second column"
            >
              {schemasB.map(ds => (
                <Select.Option value={ds.name} key={ds.name}>
                  {ds.name}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </>
    );
  }
};
