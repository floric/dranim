import React, { Component, SFC } from 'react';

import { Button, Col, Form, Icon, Input, Row } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { History } from 'history';

import { register } from '../../io/auth';

const FormItem = Form.Item;

const FormName: SFC<{ form: WrappedFormUtils }> = ({
  form: { getFieldDecorator }
}) => (
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

const FormMail: SFC<{ form: WrappedFormUtils }> = ({
  form: { getFieldDecorator }
}) => (
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

const FormPasswords: SFC<{
  validateToNextPassword: (
    rule: any,
    value: string,
    callback: () => void
  ) => void;
  compareToFirstPassword: (
    rule: any,
    value: string,
    callback: () => void
  ) => void;
  handleConfirmBlur: (e: any) => void;
  form: WrappedFormUtils;
}> = ({
  form: { getFieldDecorator },
  validateToNextPassword,
  compareToFirstPassword,
  handleConfirmBlur
}) => (
  <>
    <FormItem>
      {getFieldDecorator('password', {
        rules: [
          {
            required: true,
            message: 'Please choose a password'
          },
          {
            validator: validateToNextPassword
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
            validator: compareToFirstPassword
          }
        ]
      })(
        <Input
          type="password"
          placeholder="Confirm Password"
          onBlur={handleConfirmBlur}
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
        />
      )}
    </FormItem>
  </>
);

export type RegistrationFormProps = {
  form: WrappedFormUtils;
  history: History;
};
export type RegistrationState = { confirmDirty: boolean; isLoading: boolean };

class RegistrationFormImpl extends Component<
  RegistrationFormProps,
  RegistrationState
> {
  public state: RegistrationState = {
    confirmDirty: false,
    isLoading: false
  };

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

  public render() {
    const { form } = this.props;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormName form={form} />
        <FormMail form={form} />
        <FormPasswords
          form={form}
          compareToFirstPassword={this.compareToFirstPassword}
          handleConfirmBlur={this.handleConfirmBlur}
          validateToNextPassword={this.validateToNextPassword}
        />

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
