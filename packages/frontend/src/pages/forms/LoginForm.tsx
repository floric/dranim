import * as React from 'react';

import { Button, Form, Icon, Input } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { showNotificationWithIcon } from '../../utils/form';

class LoginFormImpl extends React.Component<{ form: WrappedFormUtils }> {
  private handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          const res = await fetch('http://localhost:3000/login', {
            body: JSON.stringify({ mail: values.mail, pw: values.pw }),
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
              'user-agent': 'Mozilla/4.0 MDN Example',
              'content-type': 'application/json'
            },
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            referrer: 'no-referrer'
          });
          if (res.status === 401) {
            showNotificationWithIcon({
              content: 'The login has failed.',
              icon: 'error',
              title: 'Login failed'
            });
            return;
          }
          showNotificationWithIcon({
            content: 'You are now logged in.',
            icon: 'success',
            title: 'Login successful'
          });
        } catch (err) {
          showNotificationWithIcon({
            content: 'Unknown error',
            icon: 'error',
            title: 'Login failed because of unknown reason'
          });
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
            rules: [{ required: true, message: 'Please input your username!' }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
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
