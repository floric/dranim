import * as React from 'react';
import { Input, Form } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation } from '../Sockets';
import {
  getOrDefault,
  formToMap,
  DataType,
  StringInputNodeDef
} from '@masterthesis/shared';

export const StringInputNode: ClientNodeDef = {
  name: StringInputNodeDef.name,
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['String', { dataType: DataType.STRING }]
    ]),
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: getOrDefault<string>(formToMap(form), 'value', '')
      })(<Input />)}
    </Form.Item>
  )
};
