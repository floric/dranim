import React from 'react';

import {
  Colors,
  DataType,
  DistinctEntriesNodeDef,
  DistinctEntriesNodeForm,
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

const ADDED_SCHEMAS = 'addedSchemas';
const DISTINCT_SCHEMAS = 'distinctSchemas';

export const DistinctEntriesNode: ClientNodeDef<
  ForEachEntryNodeInputs,
  ForEachEntryNodeOutputs,
  DistinctEntriesNodeForm
> = {
  type: DistinctEntriesNodeDef.type,
  renderFormItems: ({
    form: { getFieldDecorator, setFieldsValue, getFieldValue },
    nodeForm,
    touchForm,
    inputs,
    setTempState,
    getTempState
  }) => {
    getFieldDecorator(ADDED_SCHEMAS, {
      initialValue: nodeForm[ADDED_SCHEMAS] || []
    });
    getFieldDecorator(DISTINCT_SCHEMAS, {
      initialValue: nodeForm[DISTINCT_SCHEMAS] || []
    });
    const schemas = getFieldValue(ADDED_SCHEMAS);
    const values = getFieldValue(DISTINCT_SCHEMAS);

    if (!inputs.dataset || !inputs.dataset.isPresent) {
      return <NoDatasetInputWarning />;
    }

    return (
      <>
        <h4>Distinct Values</h4>
        <Row style={{ marginBottom: '1rem' }} gutter={8}>
          <Col xs={24} lg={18} xxl={14}>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Select Value"
              onChange={val =>
                setTempState({
                  newValue: inputs.dataset.content.schema.find(
                    n => n.name === val
                  )
                })
              }
            >
              {inputs.dataset.content.schema
                .filter(n => n.type === DataType.STRING)
                .filter(n => n.unique === false)
                .filter(n => n.required === true)
                .filter(n => values.find(v => v.name === n.name) === undefined)
                .map(o => (
                  <Select.Option value={o.name} key={o.name}>
                    {o.name}
                  </Select.Option>
                ))}
            </Select>
          </Col>
          <Col xs={24} lg={6} xxl={4}>
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
              Add distinct Value
            </Button>
          </Col>
        </Row>
        {values.map(v => renderValue(v, setFieldsValue, touchForm, values))}
        <h4>Additional Values</h4>
        <Row style={{ marginBottom: '1rem' }} gutter={8}>
          <Col xs={24} lg={6} xxl={6}>
            <Input
              defaultValue={defaultName}
              placeholder="Name"
              onChange={ev => setTempState({ newValueName: ev.target.value })}
            />
          </Col>
          <Col xs={24} lg={6} xxl={4}>
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
          <Col xs={24} lg={6} xxl={4}>
            <Checkbox.Group
              options={[UNIQUE, REQUIRED]}
              defaultValue={defaultTags}
              onChange={checkboxValues =>
                setTempState({ newValueTags: checkboxValues })
              }
            />
          </Col>
          <Col xs={24} lg={6} xxl={4}>
            <Button
              icon="plus-square"
              style={{ width: '100%' }}
              onClick={() =>
                addSchema(
                  getFieldValue,
                  setFieldsValue,
                  touchForm,
                  schemas,
                  getTempState
                )
              }
            >
              Add Schema
            </Button>
          </Col>
        </Row>
        {schemas.map(v => renderSchema(v, setFieldsValue, touchForm, schemas))}
      </>
    );
  }
};

const renderSchema = (
  v: ValueSchema,
  setFieldsValue: (obj: object) => void,
  touchForm: () => void,
  values: Array<ValueSchema>
) => (
  <Row key={v.name} justify="space-around" gutter={8}>
    <Col xs={9} lg={6} xxl={6}>
      <p>{v.name}</p>
    </Col>
    <Col xs={9} lg={12} xxl={8}>
      <Tag color={Colors[v.type]}>{v.type}</Tag>
      {v.required && <Tag>Required</Tag>}
      {v.unique && <Tag>Unique</Tag>}
    </Col>
    <Col xs={6} lg={6} xxl={3}>
      <Button
        type="dashed"
        shape="circle"
        icon="close"
        onClick={() => removeSchema(v, setFieldsValue, touchForm, values)}
      />
    </Col>
  </Row>
);

const renderValue = (
  v: ValueSchema,
  setFieldsValue: (obj: object) => void,
  touchForm: () => void,
  values: Array<ValueSchema>
) => (
  <Row key={v.name} justify="space-around" gutter={8}>
    <Col xs={9} lg={6} xxl={6}>
      <p>{v.name}</p>
    </Col>
    <Col xs={6} lg={6} xxl={3}>
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

const removeSchema = (
  v: ValueSchema,
  setFieldsValue: (obj: object) => void,
  touchForm: () => void,
  values: Array<ValueSchema>
) => {
  setFieldsValue({
    [ADDED_SCHEMAS]: values.filter(n => n.name !== v.name)
  });
  touchForm();
};

const addSchema = (
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
      title: 'Schema not added'
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
    [ADDED_SCHEMAS]: [...values, newVal]
  });
  touchForm();
};

const removeValue = (
  v: ValueSchema,
  setFieldsValue: (obj: object) => void,
  touchForm: () => void,
  values: Array<ValueSchema>
) => {
  setFieldsValue({
    [DISTINCT_SCHEMAS]: values.filter(n => n.name !== v.name)
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
  setFieldsValue({
    [DISTINCT_SCHEMAS]: [...values, tempState.newValue]
  });
  touchForm();
};
