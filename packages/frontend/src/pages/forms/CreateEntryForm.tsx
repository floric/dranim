import * as React from 'react';

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

export interface CreateEntryFormProps extends FormComponentProps {
  handleCreateEntry: (data: Values) => Promise<any>;
  schema: Array<ValueSchema>;
}

export type CreateEntryFormState = { saving: boolean };

class CreateEntryFormImpl extends React.Component<
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

  private renderType = (
    { getFieldDecorator, getFieldError, isFieldTouched }: WrappedFormUtils,
    s: ValueSchema
  ) => {
    const valueType = s.type;
    const rules = [
      {
        required: s.required,
        message: `Please specify ${s.name}`
      }
    ];
    return (
      <Form.Item
        key={s.name}
        labelCol={{
          sm: 12,
          md: 4
        }}
        wrapperCol={{
          sm: 12
        }}
        label={s.name}
        validateStatus={
          isFieldTouched(s.name) && getFieldError(s.name) ? 'error' : 'success'
        }
        help={(isFieldTouched(s.name) && getFieldError(s.name)) || ''}
      >
        {valueType === DataType.BOOLEAN &&
          getFieldDecorator(s.name, {
            initialValue: true,
            rules
          })(<Checkbox>Value</Checkbox>)}
        {valueType === DataType.STRING &&
          getFieldDecorator(s.name, {
            initialValue: '',
            rules
          })(<Input placeholder="Fallback" />)}
        {valueType === DataType.DATETIME &&
          getFieldDecorator(s.name, {
            initialValue: moment(),
            rules
          })(
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="Select Date and Time"
            />
          )}
        {valueType === DataType.TIME &&
          getFieldDecorator(s.name, {
            initialValue: moment(),
            rules
          })(<TimePicker placeholder="Select Time" />)}
        {valueType === DataType.NUMBER &&
          getFieldDecorator(s.name, {
            initialValue: 0,
            rules
          })(<InputNumber />)}
      </Form.Item>
    );
  };

  public render() {
    const {
      form,
      form: { getFieldsError },
      schema
    } = this.props;

    return (
      <Form onSubmit={this.handleSubmit}>
        {schema.map(s => this.renderType(form, s))}
        <Form.Item
          wrapperCol={{
            xs: 24,
            sm: 16
          }}
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
