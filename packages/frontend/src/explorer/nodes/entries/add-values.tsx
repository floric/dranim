import * as React from 'react';

import {
  AddValuesNodeDef,
  AddValuesNodeForm,
  Colors,
  DataType,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  SocketDef
} from '@masterthesis/shared';
import { Button, Col, Input, Row, Select, Tag } from 'antd';

import { showNotificationWithIcon } from '../../../utils/form';
import { ClientNodeDef } from '../all-nodes';

export const AddValuesNode: ClientNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  AddValuesNodeForm
> = {
  name: AddValuesNodeDef.name,
  renderFormItems: ({
    form,
    form: { getFieldDecorator, setFieldsValue, getFieldValue },
    nodeForm,
    inputs,
    touchForm,
    setTempState,
    getTempState
  }) => {
    getFieldDecorator('values', {
      initialValue: nodeForm.values || []
    });
    const values = getFieldValue('values');
    return (
      <>
        <Row style={{ marginBottom: 8 }}>
          <Col xs={24} lg={8} xxl={6}>
            <Input
              defaultValue={defaultName}
              placeholder="Name"
              onChange={ev => setTempState({ newValueName: ev.target.value })}
            />
          </Col>
          <Col xs={24} lg={8} xxl={4}>
            <Select
              defaultValue={defaultType}
              onSelect={val => setTempState({ newValueType: val })}
            >
              <Select.OptGroup label="Primitive">
                {[
                  DataType.STRING,
                  DataType.NUMBER,
                  DataType.BOOLEAN,
                  DataType.DATE
                ].map(type => (
                  <Select.Option value={type} key={`option-${type}`}>
                    {type}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Col>
          <Col xs={24} lg={8} xxl={3}>
            <Button
              icon="plus"
              style={{ width: '100%' }}
              onClick={() =>
                addValue(
                  getFieldValue,
                  setFieldsValue,
                  touchForm,
                  values,
                  getTempState
                )
              }
            >
              Add Value
            </Button>
          </Col>
        </Row>
        {values.map(v => renderValue(v, setFieldsValue, touchForm, values))}
      </>
    );
  }
};

const renderValue = (
  v: SocketDef,
  setFieldsValue: (obj: object) => void,
  touchForm: () => void,
  values: Array<SocketDef>
) => (
  <Row key={v.displayName} justify="space-around">
    <Col xs={9} lg={8} xxl={6}>
      <p>{v.displayName}</p>
    </Col>
    <Col xs={9} lg={8} xxl={4}>
      <Tag color={Colors[v.dataType]}>{v.dataType}</Tag>
    </Col>
    <Col xs={6} lg={8} xxl={3}>
      <Button
        type="dashed"
        shape="circle"
        icon="cross"
        onClick={() => removeValue(v, setFieldsValue, touchForm, values)}
      />
    </Col>
  </Row>
);

const defaultName = '';
const defaultType = DataType.STRING;

const removeValue = (
  v: SocketDef,
  setFieldsValue: (obj: object) => void,
  touchForm: () => void,
  values: Array<SocketDef>
) => {
  setFieldsValue({
    values: values.filter(n => n.displayName !== v.displayName)
  });
  touchForm();
};

const addValue = (
  getFieldValue: (name: string) => any,
  setFieldsValue: (obj: object) => void,
  touchForm: () => void,
  values: Array<SocketDef>,
  getTempState: () => any
) => {
  const tempState = getTempState();
  const displayName =
    tempState.newValueName === undefined ? defaultName : tempState.newValueName;
  const dataType =
    tempState.newValueType === undefined ? defaultType : tempState.newValueType;
  if (
    !displayName ||
    !dataType ||
    values.find(v => v.displayName === displayName) !== undefined
  ) {
    showNotificationWithIcon({
      icon: 'error',
      content: 'Name must be unique and not empty',
      title: 'Value not added'
    });
    return;
  }

  setFieldsValue({
    values: [
      ...values,
      {
        dataType,
        displayName,
        isDynamic: true
      }
    ]
  });
  touchForm();
};
