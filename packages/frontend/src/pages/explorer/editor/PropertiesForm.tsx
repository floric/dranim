import * as React from 'react';
import { SFC } from 'react';

import { Form, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { RenderFormItemsProps, EditorContext } from '../nodes/AllNodes';
import { OutputSocketInformation } from '../nodes/Sockets';
import { tryOperation } from '../../../utils/form';
import ButtonGroup from 'antd/lib/button/button-group';

const FormItem = Form.Item;

export interface PropertiesFormProps {
  handleSubmit: (form: WrappedFormUtils, nodeId: string) => Promise<any>;
  inputs: Map<string, OutputSocketInformation>;
  RenderFormItems: SFC<RenderFormItemsProps>;
  context: EditorContext;
}

class PropertiesFormImpl extends React.Component<
  PropertiesFormProps & FormComponentProps,
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
      this.setState({
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
      this.setState({
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
      RenderFormItems,
      inputs,
      context: { state, node }
    } = this.props;
    const { saving } = this.state;
    const unsavedChanges = form.isFieldsTouched();

    return (
      <Form layout="inline" hideRequiredMark onSubmit={this.handleSubmit}>
        <RenderFormItems
          form={form}
          inputs={inputs}
          state={state}
          node={node}
        />
        <FormItem wrapperCol={{ xs: 24 }}>
          <ButtonGroup>
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
          </ButtonGroup>
        </FormItem>
      </Form>
    );
  }
}

export const PropertiesForm = Form.create()(PropertiesFormImpl);
