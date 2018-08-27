import * as React from 'react';

import {
  Colors,
  ConnectionInstance,
  Dataset,
  GQLNodeInstance,
  NodeState,
  SocketInstance
} from '@masterthesis/shared';
import { Affix, Button, Card, Cascader, Col, Row } from 'antd';
import { css } from 'glamor';

import { WrappedFormUtils } from 'antd/lib/form/Form';
import { AsyncButton } from '../components/AsyncButton';
import { EXPLORER_CONTAINER, updateStage } from './editor/editor-stage';
import { NODE_WIDTH } from './editor/nodes';
import { PropertiesForm } from './editor/PropertiesForm';
import { nodeTypes, nodeTypesTree } from './nodes/all-nodes';

const filterTreeNode = (inputValue: string, path: Array<{ index: string }>) => {
  const nodeIndex = path[path.length - 1].index;
  if (!nodeIndex) {
    return false;
  }

  return nodeIndex.includes(inputValue.toLocaleLowerCase());
};

export interface ExplorerEditorProps {
  connections: Array<ConnectionInstance>;
  nodes: Array<GQLNodeInstance>;
  datasets: Array<Dataset>;
  onNodeCreate: (
    type: string,
    x: number,
    y: number,
    contextIds: Array<string>
  ) => Promise<any>;
  onNodeDelete: (id: string) => Promise<any>;
  onNodeUpdate: (id: string, x: number, y: number) => Promise<any>;
  onConnectionCreate: (
    from: SocketInstance,
    to: SocketInstance
  ) => Promise<any>;
  onConnectionDelete: (id: string) => Promise<any>;
  onStartCalculation: () => Promise<any>;
  onAddOrUpdateFormValue: (
    nodeId: string,
    name: string,
    value: string
  ) => Promise<any>;
}

export interface OpenConnection {
  dataType: string;
  destinations: null | Array<SocketInstance>;
  sources: null | Array<SocketInstance>;
}

export interface ExplorerEditorState {
  openConnection: OpenConnection | null;
  selectedNodeId: string | null;
  contextIds: Array<string>;
  container: any;
}

export class ExplorerEditor extends React.Component<
  ExplorerEditorProps,
  ExplorerEditorState
> {
  private stepInput: React.RefObject<HTMLDivElement> = React.createRef();

  public componentWillMount() {
    this.setState({
      openConnection: null,
      selectedNodeId: null,
      contextIds: []
    });
  }

  public componentDidMount() {
    this.updateCanvas();
  }

  public componentDidUpdate(
    prevProps: ExplorerEditorProps,
    prevState: ExplorerEditorState
  ) {
    if (
      JSON.stringify(prevProps) !== JSON.stringify(this.props) ||
      JSON.stringify(prevState) !== JSON.stringify(this.state)
    ) {
      this.updateCanvas();
    }
  }

  public updateCanvas() {
    updateStage(this.props, this.state, this.changeState);
  }

  private changeState = async (newState: ExplorerEditorState) => {
    this.setState(newState);
  };

  private handleDeleteSelectedNode = async () => {
    const { selectedNodeId } = this.state;
    if (selectedNodeId === null) {
      return;
    }

    await this.props.onNodeDelete(selectedNodeId);
    await this.setState({ selectedNodeId: null });
  };

  private handleStartCalulcation = async () => {
    await this.props.onStartCalculation();
  };

  private handleSelectCreateNode = (
    path: Array<string>,
    selectedOptions: Array<{ value: string }>
  ) => {
    const type = selectedOptions[selectedOptions.length - 1].value;
    if (!nodeTypes.has(type)) {
      throw new Error('Unknown node type!');
    }

    const canvas = document.getElementById(EXPLORER_CONTAINER);
    const x = canvas ? canvas.clientWidth / 2 - NODE_WIDTH / 2 : 50;
    const y = canvas ? canvas.clientHeight / 2 : 50;

    this.props.onNodeCreate(type, x, y, this.state.contextIds);
  };

  private handleEnterContext = async () => {
    if (!this.state.selectedNodeId) {
      return;
    }

    await this.setState({
      contextIds: [...this.state.contextIds, this.state.selectedNodeId],
      selectedNodeId: null
    });
  };

  private handleLeaveContext = async () =>
    this.setState({
      contextIds: this.state.contextIds.slice(
        0,
        this.state.contextIds.length - 1
      )
    });

  private handleSave = (form: WrappedFormUtils, nodeId: string) => {
    const changedNames = Object.keys(form.getFieldsValue());
    return Promise.all(
      changedNames.map(fieldName => {
        const serializedVal = JSON.stringify(form.getFieldsValue()[fieldName]);
        return this.props.onAddOrUpdateFormValue(
          nodeId,
          fieldName,
          serializedVal
        );
      })
    );
  };

  public render() {
    const { selectedNodeId, contextIds } = this.state;
    const { nodes } = this.props;

    const node = selectedNodeId
      ? nodes.find(n => n.id === selectedNodeId)
      : null;
    const nodeType = node ? nodeTypes.get(node.type) || null : null;

    const renderFormItems = node
      ? nodeTypes.get(node.type)!.renderFormItems || null
      : null;

    if (selectedNodeId) {
      document.onkeypress = (ev: KeyboardEvent) => {
        if (ev.code === 'Delete') {
          this.handleDeleteSelectedNode();
        }
      };
    } else {
      document.onkeypress = null;
    }

    const workspaceInvalid =
      nodes.length > 0
        ? !nodes.map(n => n.state === NodeState.VALID).reduce((a, b) => a && b)
        : true;

    return (
      <>
        <Row gutter={12} type="flex" justify="space-between">
          <Col>
            <Card
              bordered={false}
              title={nodeType ? nodeType.name : undefined}
              style={{ marginBottom: 12 }}
            >
              <Row gutter={12} type="flex" justify="space-between">
                <Col>
                  {renderFormItems && (
                    <PropertiesForm
                      renderFormItems={renderFormItems}
                      handleSubmit={this.handleSave}
                      context={{ state: this.props, node }}
                    />
                  )}
                </Col>
                <Col>
                  <Button.Group>
                    {contextIds.length > 0 && (
                      <AsyncButton
                        icon="minus-square"
                        fullWidth={false}
                        onClick={this.handleLeaveContext}
                      >
                        Leave Context
                      </AsyncButton>
                    )}
                    {!!node &&
                      node.hasContextFn && (
                        <AsyncButton
                          icon="plus-square"
                          fullWidth={false}
                          onClick={this.handleEnterContext}
                        >
                          Enter Context
                        </AsyncButton>
                      )}
                    {node && (
                      <AsyncButton
                        type="danger"
                        confirmMessage="Delete Node?"
                        icon="delete"
                        confirmClick
                        fullWidth={false}
                        onClick={this.handleDeleteSelectedNode}
                      />
                    )}
                    {!node && <p>No Node selected.</p>}
                  </Button.Group>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col>
            <Card bordered={false} title="Editor" style={{ marginBottom: 12 }}>
              <Button.Group>
                <AsyncButton
                  type="primary"
                  icon="rocket"
                  onClick={this.handleStartCalulcation}
                  fullWidth={false}
                  disabled={workspaceInvalid}
                >
                  Calculate
                </AsyncButton>
              </Button.Group>
            </Card>
          </Col>
        </Row>
        <Affix ref={this.state.container}>
          <Cascader
            allowClear
            showSearch={{ filter: filterTreeNode }}
            expandTrigger="hover"
            options={nodeTypesTree}
            onChange={this.handleSelectCreateNode}
          >
            <Button icon="plus">Add Node</Button>
          </Cascader>
        </Affix>
        <div
          ref={this.stepInput}
          id={EXPLORER_CONTAINER}
          {...css({
            flex: 1,
            width: '100%',
            borderBottom: `2px solid ${
              workspaceInvalid ? Colors.Warning : Colors.Success
            }`
          })}
        />
      </>
    );
  }
}
