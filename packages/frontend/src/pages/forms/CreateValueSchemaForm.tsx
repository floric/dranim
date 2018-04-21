import * as React from 'react';

import { Form, Icon, Input, Button, Select, Checkbox } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import {
  ValueSchema,
  ValueSchemaType
} from '../../../../common/src/model/valueschema';
import { FormEvent } from 'react';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const FormItem = Form.Item;
const { Option, OptGroup } = Select;

function hasErrors(fieldsError: any) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

export interface ICreateValueSchemaFormProps extends FormComponentProps {
  handleCreateValueSchema: (val: ValueSchema) => void;
}

class CreateValueSchemaFormImpl extends React.Component<
  ICreateValueSchemaFormProps
> {
  public componentDidMount() {
    this.props.form.validateFields();
  }

  private handleSubmit = (e: FormEvent<any>) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }

      this.props.handleCreateValueSchema({
        name: this.props.form.getFieldValue('name'),
        type: this.props.form.getFieldValue('type') || ValueSchemaType.string,
        required: this.props.form.getFieldValue('required')
      });
    });
  };

  private handleSelectTypeChange = (type: string) => {
    this.props.form.setFieldsValue({
      type
    });
  };

  private handleIsRequiredChange = (val: CheckboxChangeEvent) => {
    this.props.form.setFieldsValue({
      required: val.target.checked
    });
  };

  public render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched
    } = this.props.form;

    // Only show error after a field is touched.
    const nameError = isFieldTouched('name') && getFieldError('name');

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
        <FormItem label="Type">
          {getFieldDecorator('required', {
            initialValue: false
          })(
            <Checkbox onChange={this.handleIsRequiredChange}>Required</Checkbox>
          )}
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
