import * as React from 'react';

import { Form, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { RenderFormItemsProps, EditorContext } from '../nodes/AllNodes';
import { tryOperation } from '../../utils/form';
import { getInputInformation } from '../nodes/utils';
import { parseNodeForm } from '@masterthesis/shared';

export interface IPropertiesFormProps {
  handleSubmit: (form: WrappedFormUtils, nodeId: string) => Promise<any>;
  renderFormItems: (props: RenderFormItemsProps<any, any>) => JSX.Element;
  context: EditorContext;
}

class PropertiesFormImpl extends React.Component<
  IPropertiesFormProps & FormComponentProps,
  { saving: boolean }
> {
  public componentWillMount() {
    this.setState({
      saving: false
    });
  }

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
      await tryOperation({
        op: async () => {
          await handleSubmit(form, id);
        },
        successTitle: () => 'Properties saved',
        successMessage: () => `Properties saved successfully.`,
        failedTitle: 'Properties not saved.',
        failedMessage: `Saving properties has failed.`
      });
      await this.setState({
        saving: false
      });
      this.props.form.resetFields();
    });
  };

  private resetFields = () => {
    this.props.form.resetFields();
  };

  public render() {
    const {
      form,
      renderFormItems,
      context: { state, node }
    } = this.props;
    const { saving } = this.state;
    const unsavedChanges = form.isFieldsTouched();
    const inputs = node ? getInputInformation({ node, state }) : {};
    const nodeForm = node ? parseNodeForm(node) : {};

    return (
      <Form layout="inline" hideRequiredMark onSubmit={this.handleSubmit}>
        {renderFormItems({ form, inputs, state, node, nodeForm })}
        <Form.Item wrapperCol={{ xs: 24 }}>
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
