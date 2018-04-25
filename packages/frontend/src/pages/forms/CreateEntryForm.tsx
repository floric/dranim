import * as React from 'react';

import { Form, Input, Button, Checkbox, DatePicker, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import * as moment from 'moment';
import { hasErrors } from '../../utils/form';
import { Value, ValueSchema, ValueSchemaType } from '../../utils/model';

const FormItem = Form.Item;

export interface CreateEntryFormProps extends FormComponentProps {
  handleCreateEntry: (data: Array<Value>) => void;
  schema: Array<ValueSchema>;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 }
  }
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0
    },
    sm: {
      span: 16,
      offset: 6
    }
  }
};

class CreateEntryFormImpl extends React.Component<CreateEntryFormProps> {
  public componentDidMount() {
    this.props.form.validateFields();
  }

  private handleSubmit = (e: any) => {
    e.preventDefault();
    const { form, schema, handleCreateEntry } = this.props;
    form.validateFields((err, vals) => {
      if (err) {
        return;
      }

      const values = schema.map(s => ({
        val: form.getFieldValue(s.name),
        name: s.name
      }));

      handleCreateEntry(values);
    });
  };

  public render() {
    const {
      form: {
        getFieldDecorator,
        getFieldsError,
        getFieldError,
        isFieldTouched
      },
      schema
    } = this.props;

    return (
      <Form onSubmit={this.handleSubmit}>
        {schema.map(s => {
          const valueType = s.type;
          const rules = [
            {
              required: s.required,
              message: `Please specify ${s.name}`
            }
          ];

          return (
            <FormItem
              key={s.name}
              {...formItemLayout}
              label={s.name}
              validateStatus={
                isFieldTouched(s.name) && getFieldError(s.name)
                  ? 'error'
                  : 'success'
              }
              help={(isFieldTouched(s.name) && getFieldError(s.name)) || ''}
            >
              {valueType === ValueSchemaType.boolean &&
                getFieldDecorator(s.name, {
                  initialValue: true,
                  rules
                })(<Checkbox>Value</Checkbox>)}
              {valueType === ValueSchemaType.string &&
                getFieldDecorator(s.name, {
                  initialValue: '',
                  rules
                })(<Input placeholder="Fallback" />)}
              {valueType === ValueSchemaType.date &&
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
              {valueType === ValueSchemaType.number &&
                getFieldDecorator(s.name, {
                  initialValue: 0,
                  rules
                })(<InputNumber />)}
            </FormItem>
          );
        })}
        <FormItem {...tailFormItemLayout}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >
            Add Entry
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export const CreateEntryForm = Form.create()(CreateEntryFormImpl);
