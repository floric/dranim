import * as React from 'react';

import {
  Form,
  Icon,
  Input,
  Button,
  Checkbox,
  DatePicker,
  InputNumber
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import * as moment from 'moment';
import {
  ValueSchema,
  ValueSchemaType
} from '../../../../common/src/model/valueschema';
import { Value } from '../../../../common/src/model/value';
import { hasErrors } from '../../utils/form';

const FormItem = Form.Item;

export interface CreateEntryFormProps extends FormComponentProps {
  handleCreateEntry: (data: Array<Value>) => void;
  schema: Array<ValueSchema>;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
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
      offset: 8
    }
  }
};

class CreateEntryFormImpl extends React.Component<CreateEntryFormProps> {
  public componentDidMount() {
    this.props.form.validateFields();
  }

  private handleSubmit = (e: any) => {
    e.preventDefault();
    const { form, schema } = this.props;
    form.validateFields((err, vals) => {
      if (err) {
        return;
      }

      const values = schema.map(s => ({
        val: form.getFieldValue(s.name),
        ...s
      }));

      this.props.handleCreateEntry(values);
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
        {schema.map(type => {
          const valueType = type.type;
          const rules = [
            {
              required: type.required,
              message: `Please specify ${type.name}`
            }
          ];
          return (
            <FormItem
              key={type.name}
              {...formItemLayout}
              label={type.name}
              validateStatus={
                isFieldTouched(type.name) && getFieldError(type.name)
                  ? 'error'
                  : 'success'
              }
              help={
                (isFieldTouched(type.name) && getFieldError(type.name)) || ''
              }
            >
              {valueType === ValueSchemaType.boolean &&
                getFieldDecorator(type.name, {
                  initialValue: true,
                  rules
                })(<Checkbox>Value</Checkbox>)}
              {valueType === ValueSchemaType.string &&
                getFieldDecorator(type.name, {
                  initialValue: '',
                  rules
                })(
                  <Input
                    prefix={
                      <Icon type="info" style={{ color: 'rgba(0,0,0,.25)' }} />
                    }
                    placeholder="Fallback"
                  />
                )}
              {valueType === ValueSchemaType.date &&
                getFieldDecorator(type.name, {
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
                getFieldDecorator(type.name, {
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
