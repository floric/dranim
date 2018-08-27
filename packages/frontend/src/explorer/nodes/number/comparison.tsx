import * as React from 'react';

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

export const ComparisonNode: ClientNodeDef<
  ComparisonNodeInputs,
  ComparisonNodeOutputs,
  ComparisonNodeForm
> = {
  type: ComparisonNodeDef.type,
  renderName: (context, nodeForm) => {
    if (nodeForm.type === ComparisonType.LESS_THEN) {
      return 'Less Than';
    } else if (nodeForm.type === ComparisonType.GREATER_THEN) {
      return 'Greater Than';
    }

    return 'Equals';
  },
  renderFormItems: ({ form: { getFieldDecorator }, nodeForm }) => (
    <Form.Item label="Type">
      {getFieldDecorator('type', {
        initialValue: getValueOrDefault(nodeForm, 'type', ComparisonType.EQUALS)
      })(
        <Select style={{ width: 200 }} placeholder="Value">
          {[
            { type: ComparisonType.EQUALS, display: 'Equals' },
            { type: ComparisonType.GREATER_THEN, display: 'Greater Than' },
            { type: ComparisonType.LESS_THEN, display: 'Less Than' }
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
