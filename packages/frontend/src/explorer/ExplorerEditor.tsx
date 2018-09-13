import React, { Component, createRef, RefObject } from 'react';

import {
  Colors,
  Dataset,
  GQLWorkspace,
  NodeState,
  SocketInstance
} from '@masterthesis/shared';
import { Breadcrumb, Button, Card, Cascader, Col, Row, Tooltip } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import deepEqual from 'deep-equal';
import { css } from 'glamor';

import { AsyncButton } from '../components/AsyncButton';
import { showHelp } from '../components/layout/PageHeaderCard';
import { EXPLORER_CONTAINER, updateStage } from './editor/editor-stage';
import { NODE_WIDTH } from './editor/nodes';
import { PropertiesForm } from './editor/PropertiesForm';
import { nodeTypes, nodeTypesTree } from './nodes/all-nodes';

const CANVAS_STYLE = css({
  flex: 1,
  width: '100%',
  border: `1px solid ${Colors.GrayLight}`
});

const filterTreeNode = (inputValue: string, path: Array<{ index: string }>) => {
  const nodeIndex = path[path.length - 1].index;
  if (!nodeIndex) {
    return false;
  }

  return nodeIndex.includes(inputValue.toLocaleLowerCase());
};

export interface ExplorerEditorProps {
  workspace: GQLWorkspace;
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
  addNodeOpen: boolean;
}

export class ExplorerEditor extends Component<
  ExplorerEditorProps,
  ExplorerEditorState
> {
  private addNodeSearch: RefObject<Cascader> = createRef<Cascader>();

  public state: ExplorerEditorState = {
    openConnection: null,
    selectedNodeId: null,
    contextIds: [],
    addNodeOpen: false
  };

  public componentDidMount() {
    this.updateCanvas();
  }

  public componentDidUpdate(
    prevProps: ExplorerEditorProps,
    prevState: ExplorerEditorState
  ) {
    const {
      workspace: { nodes, connections },
      datasets
    } = this.props;
    const {
      workspace: { nodes: prevNodes, connections: prevConnections },
      datasets: prevDatasets
    } = prevProps;

    if (
      !deepEqual(nodes, prevNodes) ||
      !deepEqual(datasets, prevDatasets) ||
      !deepEqual(connections, prevConnections) ||
      !deepEqual(prevState, this.state)
    ) {
      this.updateCanvas();
    }
  }

  public updateCanvas() {
    updateStage(this.props, this.state, {
      changeState: this.changeState,
      enterContext: this.appendContext,
      leaveContext: this.popContext
    });
  }

  private changeState = (newState: ExplorerEditorState) =>
    this.setState(newState);

  private handleDeleteSelectedNode = () => {
    const { selectedNodeId } = this.state;
    if (selectedNodeId === null) {
      return Promise.resolve();
    }

    this.setState({ selectedNodeId: null });

    return this.props.onNodeDelete(selectedNodeId);
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

    this.setState({ addNodeOpen: false });
    this.props.onNodeCreate(type, x, y, this.state.contextIds);
  };

  private handleChangeContext = (newContext: Array<string>) =>
    this.setState({
      contextIds: newContext,
      selectedNodeId: null
    });

  private appendContext = (nodeId: string) =>
    this.setState({
      contextIds: [...this.state.contextIds, nodeId],
      selectedNodeId: null
    });

  private popContext = () =>
    this.setState({
      contextIds: this.state.contextIds.slice(
        0,
        this.state.contextIds.length - 1
      )
    });

  private handleSave = (form: WrappedFormUtils, nodeId: string) => {
    const changedNames = Object.keys(form.getFieldsValue());
    return Promise.all(
      changedNames.map(fieldName =>
        this.props.onAddOrUpdateFormValue(
          nodeId,
          fieldName,
          JSON.stringify(form.getFieldsValue()[fieldName])
        )
      )
    );
  };

  private openAddNodeSearch = () =>
    this.setState({ addNodeOpen: true }, () =>
      this.addNodeSearch.current.focus()
    );

  private handleOpenCascaderPopup = (value: boolean) => {
    if (!value) {
      this.setState({ addNodeOpen: false });
    }
  };

  public render() {
    const { selectedNodeId, contextIds, addNodeOpen } = this.state;
    const {
      workspace: { nodes, state },
      onStartCalculation
    } = this.props;

    const node = selectedNodeId
      ? nodes.find(n => n.id === selectedNodeId)
      : null;
    const nodeType = node ? nodeTypes.get(node.type) || null : null;

    const renderFormItems = node
      ? nodeTypes.get(node.type).renderFormItems || null
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

    const calculationAllowed =
      state === NodeState.VALID &&
      nodes.filter(
        n =>
          nodeTypes.get(n.type) ? nodeTypes.get(n.type).isOutputNode : false
      ).length > 0;

    return (
      <>
        <Row gutter={12} type="flex" justify="space-between">
          <Col>
            {node && (
              <Card
                bordered={false}
                title={nodeType ? nodeType.name : undefined}
                style={{ marginBottom: '1rem' }}
                extra={
                  <AsyncButton
                    type="danger"
                    tooltip="Delete selected Node"
                    confirmMessage="Delete Node?"
                    icon="delete"
                    disabled={!node}
                    confirmClick
                    onClick={this.handleDeleteSelectedNode}
                  />
                }
              >
                {renderFormItems ? (
                  <PropertiesForm
                    renderFormItems={renderFormItems}
                    handleSubmit={this.handleSave}
                    context={{ state: this.props, node }}
                  />
                ) : (
                  `This node doesn't have any custom values.`
                )}
              </Card>
            )}
          </Col>
        </Row>
        <Card bordered={false} bodyStyle={{ padding: 8 }}>
          <Row type="flex" justify="space-between" align="middle">
            <Col>
              <Button.Group>
                <Cascader
                  ref={this.addNodeSearch}
                  allowClear
                  showSearch={{ filter: filterTreeNode }}
                  expandTrigger="hover"
                  options={nodeTypesTree}
                  onChange={this.handleSelectCreateNode}
                  onPopupVisibleChange={this.handleOpenCascaderPopup}
                >
                  {!addNodeOpen ? (
                    <Button
                      onClick={this.openAddNodeSearch}
                      type="primary"
                      icon="plus-square"
                    >
                      Add Node
                    </Button>
                  ) : null}
                </Cascader>
              </Button.Group>
            </Col>
            <Col>
              <Row type="flex" align="middle">
                <Col>
                  <Breadcrumb
                    itemRender={({ breadcrumbName, fullPath }) =>
                      deepEqual(contextIds, fullPath) ? (
                        <span>{breadcrumbName}</span>
                      ) : (
                        <Tooltip title="Enter Context" mouseEnterDelay={1}>
                          <Button
                            size="small"
                            onClick={() => this.handleChangeContext(fullPath)}
                          >
                            {breadcrumbName}
                          </Button>
                        </Tooltip>
                      )
                    }
                    routes={[
                      { breadcrumbName: 'Editor', path: null, fullPath: [] },
                      ...contextIds
                        .map(cId => nodes.find(n => n.id === cId))
                        .map(n => ({ ...nodeTypes.get(n.type), ...n }))
                        .map(n => ({
                          breadcrumbName: n.name,
                          path: n.id,
                          fullPath: [...n.contextIds, n.id]
                        })),
                      ...(node && node.hasContextFn
                        ? [
                            {
                              breadcrumbName: nodeType.name,
                              path: node.id,
                              fullPath: [...node.contextIds, node.id]
                            }
                          ]
                        : [])
                    ]}
                  />
                </Col>
                <Col>
                  <Tooltip title="Help" mouseEnterDelay={1}>
                    <Button
                      style={{ border: 'none' }}
                      onClick={() =>
                        showHelp(
                          <>
                            <p>
                              Nodes with the <i>f(n)</i> symbol have{' '}
                              <b>context functions</b>. Context functions are
                              functions which are executed during its node
                              execution multiple times.
                            </p>
                            <p>
                              Double click on a node or select the level with
                              the path breadcrumbs to enter their context
                              functions.
                            </p>
                          </>
                        )
                      }
                      icon="question-circle"
                    />
                  </Tooltip>
                </Col>
              </Row>
            </Col>
            <Col>
              <Button.Group>
                <AsyncButton
                  type="primary"
                  icon="rocket"
                  onClick={onStartCalculation}
                  fullWidth={false}
                  disabled={!calculationAllowed}
                >
                  Calculate
                </AsyncButton>
              </Button.Group>
            </Col>
          </Row>
        </Card>
        <div id={EXPLORER_CONTAINER} {...CANVAS_STYLE} />
      </>
    );
  }
}
