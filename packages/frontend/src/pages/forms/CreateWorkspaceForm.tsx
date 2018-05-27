import * as React from 'react';

import { Button, Form, Icon, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

import { hasErrors } from '../../utils/form';

export interface CreateWorkspaceFormProps extends FormComponentProps {
  handleCreateWorkspace: (
    name: string,
    description: string
  ) => Promise<boolean | null>;
}

class CreateWorkspaceFormImpl extends React.Component<
  CreateWorkspaceFormProps,
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
      const successful = await this.props.handleCreateWorkspace(
        this.props.form.getFieldValue('name'),
        this.props.form.getFieldValue('description')
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
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <Form.Item
          validateStatus={nameError ? 'error' : 'success'}
          help={nameError || ''}
        >
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please enter workspace name!' }]
          })(
            <Input
              autoComplete="off"
              prefix={<Icon type="plus" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Name"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('description')(
            <Input.TextArea
              autosize={{ minRows: 2, maxRows: 6 }}
              autoComplete="off"
              placeholder="Description"
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
            Add Workspace
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export const CreateWorkspaceForm = Form.create()(CreateWorkspaceFormImpl);
