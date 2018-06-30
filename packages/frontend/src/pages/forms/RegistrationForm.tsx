import * as React from 'react';

import { Button, Col, Form, Icon, Input, Row } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { History } from 'history';

import { register } from '../../io/auth';

const FormItem = Form.Item;

class RegistrationFormImpl extends React.Component<
  { form: WrappedFormUtils; history: History },
  { confirmDirty: boolean }
> {
  public componentDidMount() {
    this.setState({
      confirmDirty: false
    });
  }

  private handleSubmit = e => {
    e.preventDefault();

    const {
      form: { validateFieldsAndScroll },
      history
    } = this.props;

    validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const res = await register(
          values.firstName,
          values.lastName,
          values.mail,
          values.password
        );
        if (res) {
          history.push('/');
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

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem>
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
          })(
            <Input
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Email"
            />
          )}
        </FormItem>
        <Row gutter={8}>
          <Col xs={24} md={12}>
            <FormItem>
              {getFieldDecorator('firstName', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your first name!',
                    whitespace: true
                  }
                ]
              })(
                <Input
                  placeholder="First name"
                  prefix={
                    <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col xs={24} md={12}>
            <FormItem>
              {getFieldDecorator('lastName', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your last name!',
                    whitespace: true
                  }
                ]
              })(<Input placeholder="Last name" />)}
            </FormItem>
          </Col>
        </Row>
        <FormItem>
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
          })(
            <Input
              type="password"
              placeholder="Password"
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          )}
        </FormItem>
        <FormItem>
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
          })(
            <Input
              type="password"
              placeholder="Confirm Password"
              onBlur={this.handleConfirmBlur}
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export const RegistrationForm = Form.create()(RegistrationFormImpl);
