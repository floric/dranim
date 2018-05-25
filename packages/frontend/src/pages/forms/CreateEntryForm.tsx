import * as React from 'react';

import { DataType, Value, ValueSchema } from '@masterthesis/shared';
import { Button, Checkbox, DatePicker, Form, Input, InputNumber } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import * as moment from 'moment';

import { hasErrors } from '../../utils/form';

export interface CreateEntryFormProps extends FormComponentProps {
  handleCreateEntry: (data: Array<Value>) => Promise<any>;
  schema: Array<ValueSchema>;
}

class CreateEntryFormImpl extends React.Component<
  CreateEntryFormProps,
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

  private handleSubmit = (e: any) => {
    e.preventDefault();
    const { form, schema, handleCreateEntry } = this.props;
    form.validateFields(async (err, vals) => {
      if (err) {
        return;
      }

      const values = schema.map(s => ({
        val: form.getFieldValue(s.name),
        name: s.name
      }));

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
            <Form.Item
              key={s.name}
              labelCol={{
                sm: 12,
                md: 4
              }}
              wrapperCol={{
                sm: 12,
                md: 12
              }}
              label={s.name}
              validateStatus={
                isFieldTouched(s.name) && getFieldError(s.name)
                  ? 'error'
                  : 'success'
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
              {valueType === DataType.DATE &&
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
              {valueType === DataType.NUMBER &&
                getFieldDecorator(s.name, {
                  initialValue: 0,
                  rules
                })(<InputNumber />)}
            </Form.Item>
          );
        })}
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
