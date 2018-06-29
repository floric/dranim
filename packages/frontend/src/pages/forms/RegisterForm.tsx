import * as React from 'react';

import { Button, Form, Icon, Input, Tooltip } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { showNotificationWithIcon } from '../../utils/form';

const FormItem = Form.Item;

class RegisterFormImpl extends React.Component<
  { form: WrappedFormUtils },
  { confirmDirty: boolean }
> {
  public componentDidMount() {
    this.setState({
      confirmDirty: false
    });
  }

  private handleSubmit = e => {
    e.preventDefault();
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        try {
          const res = await fetch('http://localhost:3000/register', {
            body: JSON.stringify({
              name: values.name,
              mail: values.mail,
              pw: values.password
            }),
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

  private handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  private compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  private validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true }, undefined);
    }
    callback();
  };

  public render() {
    const { getFieldDecorator } = this.props.form;

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

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label="Email">
          {getFieldDecorator('mail', {
            rules: [
              {
                type: 'email',
                message: 'The input is not valid Email!'
              },
              {
                required: true,
                message: 'Please input your Email!'
              }
            ]
          })(<Input />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={
            <span>
              Name&nbsp;
              <Tooltip title="Name will be shown in published contents">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
        >
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: 'Please input your name!',
                whitespace: true
              }
            ]
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="Password">
          {getFieldDecorator('password', {
            rules: [
              {
                required: true,
                message: 'Please input your password!'
              },
              {
                validator: this.validateToNextPassword
              }
            ]
          })(<Input type="password" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="Confirm Password">
          {getFieldDecorator('confirm', {
            rules: [
              {
                required: true,
                message: 'Please confirm your password!'
              },
              {
                validator: this.compareToFirstPassword
              }
            ]
          })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export const RegisterForm = Form.create()(RegisterFormImpl);
