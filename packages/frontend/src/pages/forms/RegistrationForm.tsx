import * as React from 'react';

import { Button, Col, Form, Icon, Input, Row } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { History } from 'history';

import { register } from '../../io/auth';

const FormItem = Form.Item;

class RegistrationFormImpl extends React.Component<
  { form: WrappedFormUtils; history: History },
  { confirmDirty: boolean; isLoading: boolean }
> {
  public componentWillMount() {
    this.setState({
      confirmDirty: false,
      isLoading: false
    });
  }

  private handleSubmit = e => {
    e.preventDefault();

    const {
      form: { validateFieldsAndScroll },
      history
    } = this.props;

    try {
      validateFieldsAndScroll(async (err, values) => {
        this.setState({ isLoading: true });

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

        this.setState({ isLoading: false });
      });
    } catch (err) {
      console.error(err);
      this.setState({ isLoading: false });
    }
  };

  private handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  private compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback(`Passwords don't match`);
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

  private renderNames = ({ getFieldDecorator }: WrappedFormUtils) => (
    <Row gutter={8}>
      <Col xs={24} md={12}>
        <FormItem>
          {getFieldDecorator('firstName', {
            rules: [
              {
                required: true,
                message: 'Please enter your first name',
                whitespace: true
              }
            ]
          })(
            <Input
              placeholder="First name"
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
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
                message: 'Please enter your last name',
                whitespace: true
              }
            ]
          })(<Input placeholder="Last name" />)}
        </FormItem>
      </Col>
    </Row>
  );

  private renderMail = ({ getFieldDecorator }: WrappedFormUtils) => (
    <FormItem>
      {getFieldDecorator('mail', {
        rules: [
          {
            type: 'email',
            message: 'This mail address is not valid'
          },
          {
            required: true,
            message: 'Please enter your mail address'
          }
        ]
      })(
        <Input
          prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="Email"
        />
      )}
    </FormItem>
  );

  private renderPasswords = ({ getFieldDecorator }: WrappedFormUtils) => (
    <>
      <FormItem>
        {getFieldDecorator('password', {
          rules: [
            {
              required: true,
              message: 'Please choose a password'
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
              message: 'Please confirm your password'
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
    </>
  );

  public render() {
    const { form } = this.props;

    return (
      <Form onSubmit={this.handleSubmit}>
        {this.renderNames(form)}
        {this.renderMail(form)}
        {this.renderPasswords(form)}

        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            loading={this.state.isLoading}
          >
            Register
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export const RegistrationForm = Form.create()(RegistrationFormImpl);
