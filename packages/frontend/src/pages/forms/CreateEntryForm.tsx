import React, { Component, SFC } from 'react';

import { DataType, Values, ValueSchema } from '@masterthesis/shared';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  TimePicker
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import moment from 'moment';

import { hasErrors } from '../../utils/form';

const FormType: SFC<{ form: WrappedFormUtils; valueschema: ValueSchema }> = ({
  form: { getFieldDecorator, getFieldError, isFieldTouched },
  valueschema
}) => {
  const valueType = valueschema.type;
  const rules = [
    {
      required: valueschema.required,
      message: `Please specify ${valueschema.name}`
    }
  ];

  return (
    <Form.Item
      key={valueschema.name}
      labelCol={{
        sm: 12,
        md: 4
      }}
      wrapperCol={{
        sm: 12
      }}
      label={valueschema.name}
      validateStatus={
        isFieldTouched(valueschema.name) && getFieldError(valueschema.name)
          ? 'error'
          : 'success'
      }
      help={
        (isFieldTouched(valueschema.name) && getFieldError(valueschema.name)) ||
        ''
      }
    >
      {valueType === DataType.BOOLEAN &&
        getFieldDecorator(valueschema.name, {
          initialValue: true,
          rules
        })(<Checkbox>Value</Checkbox>)}
      {valueType === DataType.STRING &&
        getFieldDecorator(valueschema.name, {
          initialValue: '',
          rules
        })(<Input placeholder="Fallback" />)}
      {valueType === DataType.DATETIME &&
        getFieldDecorator(valueschema.name, {
          initialValue: moment.utc(),
          rules
        })(
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="Select Date and Time"
          />
        )}
      {valueType === DataType.TIME &&
        getFieldDecorator(valueschema.name, {
          initialValue: moment.utc(),
          rules
        })(<TimePicker placeholder="Select Time" />)}
      {valueType === DataType.NUMBER &&
        getFieldDecorator(valueschema.name, {
          initialValue: 0,
          rules
        })(<InputNumber />)}
    </Form.Item>
  );
};

export interface CreateEntryFormProps extends FormComponentProps {
  handleCreateEntry: (data: Values) => Promise<any>;
  schema: Array<ValueSchema>;
}

export type CreateEntryFormState = { saving: boolean };

class CreateEntryFormImpl extends Component<
  CreateEntryFormProps,
  CreateEntryFormState
> {
  public state: CreateEntryFormState = { saving: false };

  public componentDidMount() {
    this.props.form.validateFields();
  }

  private handleSubmit = (e: any) => {
    e.preventDefault();
    const { form, schema, handleCreateEntry } = this.props;
    form.validateFields(async (err, vals) => {
      if (err) {
        return;
      }

      const values = {};
      schema.forEach(s => {
        values[s.name] = form.getFieldValue(s.name);
      });

      await this.setState({
        saving: true
      });
      await handleCreateEntry(values);
      await this.setState({
        saving: false
      });
    });
  };

  public render() {
    const {
      form,
      form: { getFieldsError },
      schema
    } = this.props;

    return (
      <Form onSubmit={this.handleSubmit}>
        {schema.map(s => (
          <FormType key={s.name} form={form} valueschema={s} />
        ))}
        <Form.Item
          wrapperCol={{
            xs: 24,
            sm: 16
          }}
          style={{ marginBottom: 0 }}
        >
          <Button
            loading={this.state.saving}
            type="primary"
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >
            Add Entry
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export const CreateEntryForm = Form.create()(CreateEntryFormImpl);
