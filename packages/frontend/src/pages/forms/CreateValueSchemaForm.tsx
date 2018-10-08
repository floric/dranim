import React, { Component, FormEvent, SFC } from 'react';

import { DataType, ValueSchema } from '@masterthesis/shared';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  TimePicker
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import moment from 'moment';

import { WrappedFormUtils } from 'antd/lib/form/Form';
import { hasErrors } from '../../utils/form';

const FormName: SFC<{ form: WrappedFormUtils }> = ({ form }) => {
  const { getFieldDecorator, isFieldTouched, getFieldError } = form;
  const nameError = isFieldTouched('name') && getFieldError('name');

  return (
    <Form.Item
      label="Name"
      validateStatus={nameError ? 'error' : 'success'}
      help={nameError || ''}
    >
      {getFieldDecorator('name', {
        rules: [{ required: true, message: 'Please enter an unique name!' }]
      })(<Input placeholder="Name" />)}
    </Form.Item>
  );
};

const FormRequired: SFC<{ form: WrappedFormUtils }> = ({
  form: { getFieldDecorator }
}) => (
  <Form.Item label="Required">
    {getFieldDecorator('required', {
      initialValue: true
    })(<Checkbox defaultChecked />)}
  </Form.Item>
);

const FormUnique: SFC<{ form: WrappedFormUtils }> = ({
  form: { getFieldDecorator }
}) => (
  <Form.Item label="Unique">
    {getFieldDecorator('unique', {
      initialValue: false
    })(<Checkbox />)}
  </Form.Item>
);

const FormType: SFC<{
  form: WrappedFormUtils;
  handleSelectTypeChange: (type: string) => void;
}> = ({ form: { getFieldDecorator }, handleSelectTypeChange }) => (
  <Form.Item label="Type">
    {getFieldDecorator('type', {
      initialValue: DataType.STRING
    })(
      <Select onChange={handleSelectTypeChange} style={{ width: 120 }}>
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
    )}
  </Form.Item>
);

export interface CreateValueSchemaFormProps extends FormComponentProps {
  handleCreateValueSchema: (value: ValueSchema) => void;
}

export type CreateValueSchemaFormState = { saving: boolean };

class CreateValueSchemaFormImpl extends Component<
  CreateValueSchemaFormProps,
  CreateValueSchemaFormState
> {
  public state: CreateValueSchemaFormState = { saving: false };

  public componentDidMount() {
    this.props.form.validateFields();
  }

  private handleSubmit = (e: FormEvent<any>) => {
    e.preventDefault();
    const { form, handleCreateValueSchema } = this.props;
    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      const name = form.getFieldValue('name');
      const type = form.getFieldValue('type');
      const required = form.getFieldValue('required');
      const unique = form.getFieldValue('unique');

      let fallback = '';
      switch (type) {
        case DataType.BOOLEAN:
          fallback = form.getFieldValue('fallbackBoolean');
          break;
        case DataType.DATETIME:
          fallback = form.getFieldValue('fallbackDatetime');
          break;
        case DataType.TIME:
          fallback = form.getFieldValue('fallbackTime');
          break;
        case DataType.NUMBER:
          fallback = form.getFieldValue('fallbackNumber');
          break;
        case DataType.STRING:
          fallback = form.getFieldValue('fallbackString');
          break;
        default:
          throw new Error('Unsupported Field type!');
      }
      if (fallback == null) {
        fallback = '';
      }

      this.setState({
        saving: true
      });

      await handleCreateValueSchema({
        name,
        type,
        required,
        fallback: JSON.stringify(fallback),
        unique: type === DataType.STRING ? unique : false
      });

      this.setState({
        saving: false
      });
    });
  };

  private handleSelectTypeChange = (type: string) => {
    this.props.form.setFieldsValue({
      type
    });
  };

  public render() {
    const {
      form,
      form: { getFieldsError, getFieldValue }
    } = this.props;
    const valueType = getFieldValue('type');
    const unique = getFieldValue('required');

    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        <FormName form={form} />
        <FormType
          form={form}
          handleSelectTypeChange={this.handleSelectTypeChange}
        />

        {unique === false ? (
          <>
            {valueType === DataType.BOOLEAN && renderBooleanInput(form)}
            {valueType === DataType.STRING && renderStringInput(form)}
            {valueType === DataType.DATETIME && renderDatetimeInput(form)}
            {valueType === DataType.TIME && renderTimeInput(form)}
            {valueType === DataType.NUMBER && renderNumberInput(form)}
          </>
        ) : null}

        <FormRequired form={form} />
        {valueType === DataType.STRING && <FormUnique form={form} />}
        <Form.Item>
          <Button
            type="primary"
            loading={this.state.saving}
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >
            Add Field
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const renderBooleanInput = ({ getFieldDecorator }: WrappedFormUtils) => (
  <Form.Item label="Fallback">
    {getFieldDecorator('fallbackBoolean', {
      initialValue: false
    })(<Checkbox>Value</Checkbox>)}
  </Form.Item>
);

const renderStringInput = ({ getFieldDecorator }: WrappedFormUtils) => (
  <Form.Item label="Fallback">
    {getFieldDecorator('fallbackString', {
      initialValue: ''
    })(<Input placeholder="Fallback" />)}
  </Form.Item>
);

const renderDatetimeInput = ({ getFieldDecorator }: WrappedFormUtils) => (
  <Form.Item label="Fallback">
    {getFieldDecorator('fallbackDatetime', {
      initialValue: moment.utc(),
      rules: [{ required: true, message: 'Please specify a value.' }]
    })(
      <DatePicker
        showTime
        format="YYYY-MM-DD HH:mm:ss"
        placeholder="Select Date and Time"
      />
    )}
  </Form.Item>
);

const renderTimeInput = ({ getFieldDecorator }: WrappedFormUtils) => (
  <Form.Item label="Fallback">
    {getFieldDecorator('fallbackTime', {
      initialValue: moment.utc(),
      rules: [{ required: true, message: 'Please specify a value.' }]
    })(<TimePicker placeholder="Select Time" />)}
  </Form.Item>
);

const renderNumberInput = ({ getFieldDecorator }: WrappedFormUtils) => (
  <Form.Item label="Fallback">
    {getFieldDecorator('fallbackNumber', {
      initialValue: 0,
      rules: [{ required: true, message: 'Please specify a value.' }]
    })(<InputNumber />)}
  </Form.Item>
);

export const CreateValueSchemaForm = Form.create()(CreateValueSchemaFormImpl);
