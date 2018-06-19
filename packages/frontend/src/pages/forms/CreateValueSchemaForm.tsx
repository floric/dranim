import * as React from 'react';
import { FormEvent } from 'react';

import { DataType, ValueSchema } from '@masterthesis/shared';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import * as moment from 'moment';

import { hasErrors } from '../../utils/form';

export interface CreateValueSchemaFormProps extends FormComponentProps {
  handleCreateValueSchema: (value: ValueSchema) => void;
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
        case DataType.BOOLEAN:
          fallback = form.getFieldValue('fallbackBoolean');
          break;
        case DataType.DATETIME:
          fallback = form.getFieldValue('fallbackDatetime');
          break;
        case DataType.NUMBER:
          fallback = form.getFieldValue('fallbackNumber');
          break;
        case DataType.STRING:
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
        unique: type === DataType.STRING ? form.getFieldValue('unique') : false
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
            initialValue: DataType.STRING
          })(
            <Select
              onChange={this.handleSelectTypeChange}
              style={{ width: 120 }}
            >
              <Select.OptGroup label="Primitive">
                {[
                  DataType.STRING,
                  DataType.NUMBER,
                  DataType.BOOLEAN,
                  DataType.DATETIME
                ].map(type => (
                  <Select.Option value={type} key={`option-${type}`}>
                    {type}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          )}
        </Form.Item>
        {valueType === DataType.BOOLEAN && (
          <Form.Item label="Fallback">
            {getFieldDecorator('fallbackBoolean', {
              initialValue: false
            })(<Checkbox>Value</Checkbox>)}
          </Form.Item>
        )}
        {valueType === DataType.STRING && (
          <Form.Item label="Fallback">
            {getFieldDecorator('fallbackString', {
              initialValue: ''
            })(<Input placeholder="Fallback" />)}
          </Form.Item>
        )}
        {valueType === DataType.DATETIME && (
          <Form.Item label="Fallback">
            {getFieldDecorator('fallbackDatetime', {
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
        {valueType === DataType.NUMBER && (
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
        {valueType === DataType.STRING && (
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
