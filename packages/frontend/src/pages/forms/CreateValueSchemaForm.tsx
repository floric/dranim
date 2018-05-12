import * as React from 'react';

import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  DatePicker,
  InputNumber
} from 'antd';
import * as moment from 'moment';
import { FormComponentProps } from 'antd/lib/form';
import { FormEvent } from 'react';
import { hasErrors } from '../../utils/form';
import { ValueSchema, ValueSchemaType } from '../../utils/model';

export interface CreateValueSchemaFormProps extends FormComponentProps {
  handleCreateValueSchema: (val: ValueSchema) => void;
}

class CreateValueSchemaFormImpl extends React.Component<
  CreateValueSchemaFormProps,
  { saving: boolean }
> {
  public componentWillMount() {
    this.setState({
      saving: false
    });
  }

  public componentDidMount() {
    this.props.form.validateFields();
  }

  private handleSubmit = (e: FormEvent<any>) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      const name = form.getFieldValue('name');
      const type = form.getFieldValue('type');
      const required = form.getFieldValue('required');

      let fallback = '';
      switch (type) {
        case ValueSchemaType.boolean:
          fallback = form.getFieldValue('fallbackBoolean');
          break;
        case ValueSchemaType.date:
          fallback = form.getFieldValue('fallbackDate');
          break;
        case ValueSchemaType.number:
          fallback = form.getFieldValue('fallbackNumber');
          break;
        case ValueSchemaType.string:
          fallback = form.getFieldValue('fallbackString');
          break;
        default:
          throw new Error('Unsupported value schema type!');
      }

      await this.setState({
        saving: true
      });

      await this.props.handleCreateValueSchema({
        name,
        type,
        required,
        fallback,
        unique:
          type === ValueSchemaType.string ? form.getFieldValue('unique') : false
      });

      await this.setState({
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
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      getFieldValue,
      isFieldTouched
    } = this.props.form;

    // Only show error after a field is touched.
    const nameError = isFieldTouched('name') && getFieldError('name');
    const valueType = getFieldValue('type');

    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        <Form.Item
          label="Name"
          validateStatus={nameError ? 'error' : 'success'}
          help={nameError || ''}
        >
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please enter an unique name!' }]
          })(<Input placeholder="Name" />)}
        </Form.Item>
        <Form.Item label="Type">
          {getFieldDecorator('type', {
            initialValue: ValueSchemaType.string
          })(
            <Select
              onChange={this.handleSelectTypeChange}
              style={{ width: 120 }}
            >
              <Select.OptGroup label="Primitive">
                {Object.keys(ValueSchemaType).map(t => (
                  <Select.Option value={ValueSchemaType[t]} key={`option-${t}`}>
                    {ValueSchemaType[t]}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          )}
        </Form.Item>
        {valueType === ValueSchemaType.boolean && (
          <Form.Item label="Fallback">
            {getFieldDecorator('fallbackBoolean', {
              initialValue: false
            })(<Checkbox>Value</Checkbox>)}
          </Form.Item>
        )}
        {valueType === ValueSchemaType.string && (
          <Form.Item label="Fallback">
            {getFieldDecorator('fallbackString', {
              initialValue: ''
            })(<Input placeholder="Fallback" />)}
          </Form.Item>
        )}
        {valueType === ValueSchemaType.date && (
          <Form.Item label="Fallback">
            {getFieldDecorator('fallbackDate', {
              initialValue: moment(),
              rules: [{ required: true, message: 'Please specify a value.' }]
            })(
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="Select Date and Time"
              />
            )}
          </Form.Item>
        )}
        {valueType === ValueSchemaType.number && (
          <Form.Item label="Fallback">
            {getFieldDecorator('fallbackNumber', {
              initialValue: 0,
              rules: [{ required: true, message: 'Please specify a value.' }]
            })(<InputNumber />)}
          </Form.Item>
        )}
        <Form.Item label="Required">
          {getFieldDecorator('required', {
            initialValue: false
          })(<Checkbox />)}
        </Form.Item>
        {valueType === ValueSchemaType.string && (
          <Form.Item label="Unique">
            {getFieldDecorator('unique', {
              initialValue: false
            })(<Checkbox />)}
          </Form.Item>
        )}
        <Form.Item>
          <Button
            type="primary"
            loading={this.state.saving}
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >
            Add Value Schema
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export const CreateValueSchemaForm = Form.create()(CreateValueSchemaFormImpl);
