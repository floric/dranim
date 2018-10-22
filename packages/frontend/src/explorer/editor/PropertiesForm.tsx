import React, { Component } from 'react';

import { Button, Form } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { tryMutation } from '../../utils/form';
import { EditorContext, RenderFormItemsProps } from '../nodes/all-nodes';

export interface PropertiesFormProps {
  handleSubmit: (form: WrappedFormUtils, nodeId: string) => Promise<any>;
  renderFormItems: (props: RenderFormItemsProps<any, any>) => JSX.Element;
  context: EditorContext;
}

export type PropertiesFormState = {
  saving: boolean;
  isTouched: boolean;
  temp: any;
};

class PropertiesFormImpl extends Component<
  PropertiesFormProps & FormComponentProps,
  PropertiesFormState
> {
  public state: PropertiesFormState = {
    saving: false,
    isTouched: false,
    temp: {}
  };

  public componentDidMount() {
    this.props.form.validateFields();
  }

  private handleSubmit = (e: any) => {
    e.preventDefault();
    const {
      form,
      context: {
        node: { id }
      },
      handleSubmit
    } = this.props;

    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      await this.setState({
        saving: true
      });
      await tryMutation({
        op: () => handleSubmit(form, id),
        successTitle: () => 'Properties saved',
        successMessage: () => `Properties saved successfully.`,
        failedTitle: 'Properties not saved.',
        failedMessage: `Saving properties has failed.`
      });
      await this.setState({
        saving: false,
        isTouched: false
      });
      this.props.form.resetFields();
    });
  };

  private resetFields = () => this.props.form.resetFields();

  private setTempState = (s: any) =>
    this.setState({ temp: { ...this.state.temp, ...s } });

  private getTempState = () => this.state.temp;

  private touchTempState = () => this.setState({ isTouched: true });

  public render() {
    const {
      form,
      renderFormItems,
      context: { state, node }
    } = this.props;
    const { saving } = this.state;
    const unsavedChanges = form.isFieldsTouched() || this.state.isTouched;
    const inputs = node ? node.metaInputs : {};
    const nodeForm = node ? node.form : {};

    return (
      <Form layout="inline" hideRequiredMark onSubmit={this.handleSubmit}>
        {renderFormItems({
          form,
          inputs,
          state,
          node,
          nodeForm,
          touchForm: this.touchTempState,
          getTempState: this.getTempState,
          setTempState: this.setTempState
        })}
        <Form.Item>
          <Button.Group>
            <Button
              type="primary"
              disabled={!unsavedChanges}
              icon="save"
              htmlType="submit"
              loading={saving}
            >
              Save
            </Button>
            {unsavedChanges && (
              <Button onClick={this.resetFields}>Cancel</Button>
            )}
          </Button.Group>
        </Form.Item>
      </Form>
    );
  }
}

export const PropertiesForm = Form.create()(PropertiesFormImpl);
