import React from 'react';

import {
  Colors,
  DataType,
  EditEntriesNodeDef,
  EditEntriesNodeForm,
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  ValueSchema
} from '@masterthesis/shared';
import { Button, Checkbox, Col, Input, Row, Select, Tag } from 'antd';

import { NoDatasetInputWarning } from '../../../components/Warnings';
import { showNotificationWithIcon } from '../../../utils/form';
import { ClientNodeDef } from '../all-nodes';

const UNIQUE = 'unique';
const REQUIRED = 'required';

export const EditEntriesNode: ClientNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  EditEntriesNodeForm
> = {
  type: EditEntriesNodeDef.type,
  renderFormItems: ({
    form: { getFieldDecorator, setFieldsValue, getFieldValue },
    inputs,
    nodeForm,
    touchForm,
    setTempState,
    getTempState
  }) => {
    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return <NoDatasetInputWarning />;
    }

    getFieldDecorator('values', {
      initialValue: nodeForm.values || inputs.dataset.content.schema || []
    });
    const values = getFieldValue('values');
    return (
      <>
        <Row style={{ marginBottom: '1rem' }} gutter={8}>
          <Col xs={24} lg={6}>
            <Input
              defaultValue={defaultName}
              placeholder="Name"
              onChange={ev => setTempState({ newValueName: ev.target.value })}
            />
          </Col>
          <Col xs={24} lg={6}>
            <Select
              defaultValue={defaultType}
              onSelect={val => setTempState({ newValueType: val })}
            >
              <Select.OptGroup label="Primitive">
                {[
                  DataType.STRING,
                  DataType.NUMBER,
                  DataType.BOOLEAN,
                  DataType.DATETIME,
                  DataType.TIME
                ].map(type => (
                  <Select.Option value={type} key={`option-${type}`}>
                    {type}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Col>
          <Col xs={24} lg={6}>
            <Checkbox.Group
              options={[UNIQUE, REQUIRED]}
              defaultValue={defaultTags}
              onChange={checkboxValues =>
                setTempState({ newValueTags: checkboxValues })
              }
            />
          </Col>
          <Col xs={24} lg={6}>
            <Button
              icon="plus-square"
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
  v: ValueSchema,
  setFieldsValue: (obj: object) => void,
  touchForm: () => void,
  values: Array<ValueSchema>
) => (
  <Row key={v.name} justify="space-around" gutter={8}>
    <Col xs={9} lg={6}>
      <p>{v.name}</p>
    </Col>
    <Col xs={9} lg={12}>
      <Tag color={Colors[v.type]}>{v.type}</Tag>
      {v.required && <Tag>Required</Tag>}
      {v.unique && <Tag>Unique</Tag>}
    </Col>
    <Col xs={6} lg={6}>
      <Button
        type="dashed"
        shape="circle"
        icon="close"
        onClick={() => removeValue(v, setFieldsValue, touchForm, values)}
      />
    </Col>
  </Row>
);

const defaultName = '';
const defaultType = DataType.STRING;
const defaultTags = [REQUIRED];

const removeValue = (
  v: ValueSchema,
  setFieldsValue: (obj: object) => void,
  touchForm: () => void,
  values: Array<ValueSchema>
) => {
  setFieldsValue({
    values: values.filter(n => n.name !== v.name)
  });
  touchForm();
};

const addValue = (
  getFieldValue: (name: string) => any,
  setFieldsValue: (obj: object) => void,
  touchForm: () => void,
  values: Array<ValueSchema>,
  getTempState: () => any
) => {
  const tempState = getTempState();
  const name =
    tempState.newValueName === undefined ? defaultName : tempState.newValueName;
  const type =
    tempState.newValueType === undefined ? defaultType : tempState.newValueType;
  const required =
    tempState.newValueTags === undefined
      ? defaultTags.includes(REQUIRED)
      : tempState.newValueTags.includes(REQUIRED);
  const unique =
    tempState.newValueTags === undefined
      ? defaultTags.includes(UNIQUE)
      : tempState.newValueTags.includes(UNIQUE);
  if (!name || !type || values.find(v => v.name === name) !== undefined) {
    showNotificationWithIcon({
      icon: 'error',
      content: 'Name must be unique and not empty',
      title: 'Value not added'
    });
    return;
  }

  const newVal: ValueSchema = {
    name,
    type,
    fallback: '',
    required,
    unique
  };

  setFieldsValue({
    values: [...values, newVal]
  });
  touchForm();
};
