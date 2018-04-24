import * as React from 'react';

import { Form, Icon, Input, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { hasErrors } from '../../utils/form';

const FormItem = Form.Item;

export interface CreateDataSetFormProps extends FormComponentProps {
  handleCreateDataset: (name: string) => void;
}

class CreateDataSetFormImpl extends React.Component<CreateDataSetFormProps> {
  public componentDidMount() {
    this.props.form.validateFields();
  }

  private handleSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }

      this.props.handleCreateDataset(this.props.form.getFieldValue('name'));
    });
  };

  public render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched
    } = this.props.form;

    const nameError = isFieldTouched('name') && getFieldError('name');

    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        <FormItem
          validateStatus={nameError ? 'error' : 'success'}
          help={nameError || ''}
        >
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please enter dataset name!' }]
          })(
            <Input
              prefix={<Icon type="plus" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Name"
            />
          )}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >
            Add Dataset
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export const CreateDataSetForm = Form.create()(CreateDataSetFormImpl);
