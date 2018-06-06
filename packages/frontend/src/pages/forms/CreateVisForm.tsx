import * as React from 'react';

import { Button, Form, Icon, Input, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Query } from 'react-apollo';

import { ALL_DATASETS } from '../../App';
import { LoadingCard } from '../../components/CustomCards';
import { hasErrors } from '../../utils/form';

export interface CreateVisFormProps extends FormComponentProps {
  handleCreate: (name: string, datasetId: string) => Promise<boolean | null>;
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
        this.props.form.getFieldValue('name'),
        this.props.form.getFieldValue('dataset')
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
      <Query query={ALL_DATASETS}>
        {res => {
          if (res.loading || res.error) {
            return <LoadingCard />;
          }

          return (
            <Form layout="inline" onSubmit={this.handleSubmit}>
              <Form.Item
                label="Name"
                validateStatus={nameError ? 'error' : 'success'}
                help={nameError || ''}
              >
                {getFieldDecorator('name', {
                  rules: [
                    { required: true, message: 'Please enter dataset name!' }
                  ]
                })(
                  <Input
                    autoComplete="off"
                    prefix={
                      <Icon type="plus" style={{ color: 'rgba(0,0,0,.25)' }} />
                    }
                    placeholder="Name"
                  />
                )}
              </Form.Item>
              <Form.Item label="Dataset">
                {getFieldDecorator('dataset', {
                  rules: [{ required: true }],
                  initialValue:
                    res.data.datasets.length > 0 ? res.data.datasets[0].id : ''
                })(
                  <Select style={{ width: 300 }}>
                    {res.data.datasets.map(ds => (
                      <Select.Option key={ds.id}>{ds.name}</Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={this.state.saving}
                  disabled={hasErrors(getFieldsError())}
                >
                  Create Visualization
                </Button>
              </Form.Item>
            </Form>
          );
        }}
      </Query>
    );
  }
}

export const CreateVisForm = Form.create()(CreateVisFormImpl);
