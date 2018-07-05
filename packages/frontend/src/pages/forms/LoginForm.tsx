import * as React from 'react';

import { Button, Form, Icon, Input } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { History } from 'history';

import { login } from '../../io/auth';

class LoginFormImpl extends React.Component<
  {
    form: WrappedFormUtils;
    history: History;
  },
  { isLoading: boolean }
> {
  public componentWillMount() {
    this.setState({ isLoading: false });
  }

  private handleSubmit = e => {
    e.preventDefault();

    const {
      form: { validateFields },
      history
    } = this.props;

    try {
      validateFields(async (err, values) => {
        this.setState({ isLoading: true });

        if (!err) {
          const res = await login(values.mail, values.pw);
          if (res) {
            history.push('/');
          }
        }

        this.setState({ isLoading: false });
      });
    } catch (err) {
      console.error(err);
      this.setState({ isLoading: false });
    }
  };

  public render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          {getFieldDecorator('mail', {
            rules: [
              { required: true, message: 'Please enter your mail address' }
            ]
          })(
            <Input
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Email"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('pw', {
            rules: [{ required: true, message: 'Please enter your password' }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={this.state.isLoading}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export const LoginForm = Form.create()(LoginFormImpl);
