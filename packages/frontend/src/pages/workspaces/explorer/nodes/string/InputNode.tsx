import * as React from 'react';
import { Input, Form } from 'antd';
import { ClientNodeDef } from '../AllNodes';
import { OutputSocketInformation, STRING_TYPE } from '../Sockets';
import { getOrDefault, formToMap } from '@masterthesis/shared';

export const StringInputNode: ClientNodeDef = {
  title: 'String Input',
  onClientExecution: () =>
    new Map<string, OutputSocketInformation>([
      ['String', { dataType: STRING_TYPE }]
    ]),
  renderFormItems: ({ form: { getFieldDecorator }, node: { form } }) => (
    <Form.Item label="Value">
      {getFieldDecorator('value', {
        initialValue: getOrDefault<string>(formToMap(form), 'value', '')
      })(<Input />)}
    </Form.Item>
  )
};
