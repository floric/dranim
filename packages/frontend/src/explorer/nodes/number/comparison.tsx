import React from 'react';

import {
  ComparisonNodeDef,
  ComparisonNodeForm,
  ComparisonNodeInputs,
  ComparisonNodeOutputs,
  ComparisonType
} from '@masterthesis/shared';
import { Form, Select } from 'antd';

import { ClientNodeDef } from '../all-nodes';
import { getValueOrDefault } from '../utils';

const GREATER_THAN = 'Greater Than';
const LESS_THAN = 'Less Than';
const EQUALS = 'Equals';

export const ComparisonNode: ClientNodeDef<
  ComparisonNodeInputs,
  ComparisonNodeOutputs,
  ComparisonNodeForm
> = {
  type: ComparisonNodeDef.type,
  renderName: (context, nodeForm) => {
    if (nodeForm.type === ComparisonType.LESS_THAN) {
      return LESS_THAN;
    } else if (nodeForm.type === ComparisonType.GREATER_THAN) {
      return GREATER_THAN;
    }

    return EQUALS;
  },
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Type">
      {getFieldDecorator('type', {
        initialValue: getValueOrDefault(nodeForm, 'type', ComparisonType.EQUALS)
      })(
        <Select style={{ width: 200 }} placeholder="Value">
          {[
            { type: ComparisonType.EQUALS, display: EQUALS },
            { type: ComparisonType.GREATER_THAN, display: GREATER_THAN },
            { type: ComparisonType.LESS_THAN, display: LESS_THAN }
          ].map(o => (
            <Select.Option value={o.type} key={o.type}>
              {o.display}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  )
};
