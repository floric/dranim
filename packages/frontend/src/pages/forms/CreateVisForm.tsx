import * as React from 'react';

import { Button, Form, Icon, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

import { hasErrors } from '../../utils/form';

export interface CreateVisFormProps extends FormComponentProps {
  handleCreate: (name: string) => Promise<boolean | null>;
}

class CreateVisFormImpl extends React.Component<
  CreateVisFormProps,
  { saving: boolean }
> {
  public componentWillMount() {
    this.setState({ saving: false });
  }

  public componentDidMount() {
    this.props.form.validateFields();
  }

  private handleSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      await this.setState({ saving: true });
      const successful = await this.props.handleCreate(
        this.props.form.getFieldValue('name')
      );
      await this.setState({ saving: false });
      if (successful) {
        this.props.form.resetFields();
      }
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
        <Form.Item
          label="Name"
          validateStatus={nameError ? 'error' : 'success'}
          help={nameError || ''}
        >
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please enter a name!' }]
          })(
            <Input
              autoComplete="off"
              prefix={<Icon type="plus" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Name"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={this.state.saving}
            disabled={hasErrors(getFieldsError())}
          >
            Create Dashboard
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export const CreateVisForm = Form.create()(CreateVisFormImpl);
