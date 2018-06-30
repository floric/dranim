import * as React from 'react';

import { Button, Form, Icon, Input } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { History } from 'history';

import { login } from '../../io/auth';

class LoginFormImpl extends React.Component<{
  form: WrappedFormUtils;
  history: History;
}> {
  private handleSubmit = e => {
    e.preventDefault();

    const {
      form: { validateFields },
      history
    } = this.props;

    validateFields(async (err, values) => {
      if (!err) {
        const res = await login(values.mail, values.pw);
        if (res) {
          history.push('/');
        }
      }
    });
  };

  public render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <Form.Item>
          {getFieldDecorator('mail', {
            rules: [
              { required: true, message: 'Please input your Email address!' }
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
            rules: [{ required: true, message: 'Please input your Password!' }]
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
            className="login-form-button"
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export const LoginForm = Form.create()(LoginFormImpl);
