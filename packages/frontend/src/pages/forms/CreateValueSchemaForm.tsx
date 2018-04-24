import * as React from 'react';

import {
  Form,
  Icon,
  Input,
  Button,
  Select,
  Checkbox,
  DatePicker,
  InputNumber
} from 'antd';
import * as moment from 'moment';
import { FormComponentProps } from 'antd/lib/form';
import {
  ValueSchema,
  ValueSchemaType
} from '../../../../common/src/model/valueschema';
import { FormEvent } from 'react';
import { hasErrors } from '../../utils/form';

const FormItem = Form.Item;
const { Option, OptGroup } = Select;

export interface CreateValueSchemaFormProps extends FormComponentProps {
  handleCreateValueSchema: (val: ValueSchema) => void;
}

class CreateValueSchemaFormImpl extends React.Component<
  CreateValueSchemaFormProps
> {
  public componentDidMount() {
    this.props.form.validateFields();
  }

  private handleSubmit = (e: FormEvent<any>) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
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

      this.props.handleCreateValueSchema({
        name,
        type,
        required,
        fallback
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
        <FormItem
          label="Name"
          validateStatus={nameError ? 'error' : 'success'}
          help={nameError || ''}
        >
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please enter an unique name!' }]
          })(
            <Input
              prefix={<Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Name"
            />
          )}
        </FormItem>
        <FormItem label="Type">
          {getFieldDecorator('type', {
            initialValue: ValueSchemaType.string
          })(
            <Select
              onChange={this.handleSelectTypeChange}
              style={{ width: 120 }}
            >
              <OptGroup label="Primitive">
                {Object.keys(ValueSchemaType).map(t => (
                  <Option value={ValueSchemaType[t]} key={`option-${t}`}>
                    {ValueSchemaType[t]}
                  </Option>
                ))}
              </OptGroup>
            </Select>
          )}
        </FormItem>
        {valueType === ValueSchemaType.boolean && (
          <FormItem label="Fallback">
            {getFieldDecorator('fallbackBoolean', {
              initialValue: false
            })(<Checkbox>Value</Checkbox>)}
          </FormItem>
        )}
        {valueType === ValueSchemaType.string && (
          <FormItem label="Fallback">
            {getFieldDecorator('fallbackString', {
              initialValue: ''
            })(
              <Input
                prefix={
                  <Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />
                }
                placeholder="Fallback"
              />
            )}
          </FormItem>
        )}
        {valueType === ValueSchemaType.date && (
          <FormItem label="Fallback">
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
          </FormItem>
        )}
        {valueType === ValueSchemaType.number && (
          <FormItem label="Fallback">
            {getFieldDecorator('fallbackNumber', {
              initialValue: 0,
              rules: [{ required: true, message: 'Please specify a value.' }]
            })(<InputNumber />)}
          </FormItem>
        )}
        <FormItem label="Required">
          {getFieldDecorator('required', {
            initialValue: false
          })(<Checkbox>Required</Checkbox>)}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >
            Add Value Schema
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export const CreateValueSchemaForm = Form.create()(CreateValueSchemaFormImpl);
