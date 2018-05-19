import * as React from 'react';
import { Card, Row, Col, TreeSelect } from 'antd';
import { css } from 'glamor';

import { nodeTypes, nodeTypesTree } from './nodes/AllNodes';
import { EXPLORER_CONTAINER, updateStage } from './editor/EditorStage';
import { NODE_WIDTH } from './editor/Nodes';
import { OutputSocketInformation } from './nodes/Sockets';
import { getInputInformation } from './nodes/utils';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { PropertiesForm } from './editor/PropertiesForm';
import { AsyncButton } from '../../../components/AsyncButton';
import {
  ConnectionInstance,
  NodeInstance,
  SocketInstance,
  Dataset
} from '@masterthesis/shared';
import { Ref } from 'react';

const filterTreeNode = (inputValue: string, treeNode: any) => {
  if (!treeNode.props.index) {
    return false;
  }

  return treeNode.props.index.includes(inputValue.toLocaleLowerCase());
};

export interface ExplorerEditorProps {
  connections: Array<ConnectionInstance>;
  nodes: Array<NodeInstance>;
  datasets: Array<Dataset>;
  onNodeCreate: (type: string, x: number, y: number) => Promise<any>;
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
  inputs: null | Array<SocketInstance>;
  outputs: null | Array<SocketInstance>;
}

export interface ExplorerEditorState {
  openConnection: OpenConnection | null;
  selectedNode: string | null;
}

export class ExplorerEditor extends React.Component<
  ExplorerEditorProps,
  ExplorerEditorState
> {
  private selectNodeRef: Ref<TreeSelect> = React.createRef<TreeSelect>();

  public componentWillMount() {
    this.setState({
      openConnection: null,
      selectedNode: null
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

  private changeState = async (newState: ExplorerEditorState) => {
    this.setState(newState);
  };

  public updateCanvas() {
    updateStage(EXPLORER_CONTAINER, this.props, this.state, this.changeState);
  }

  private handleDeleteSelectedNode = async () => {
    const { selectedNode } = this.state;
    if (selectedNode === null) {
      return;
    }

    await this.props.onNodeDelete(selectedNode);
    await this.setState({ selectedNode: null });
  };

  private handleStartCalulcation = async () => {
    await this.props.onStartCalculation();
  };

  private handleSelectCreateNode = (type: string) => {
    if (!nodeTypes.has(type)) {
      return;
    }

    const canvas = document.getElementById(EXPLORER_CONTAINER);
    const x = canvas ? canvas.clientWidth / 2 - NODE_WIDTH / 2 : 50;
    const y = canvas ? canvas.clientHeight / 2 : 50;

    this.props.onNodeCreate(type, x, y);
  };

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
    const { selectedNode } = this.state;
    const { nodes } = this.props;

    const node = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

    const renderFormItems = node
      ? nodeTypes.get(node.type)!.renderFormItems || null
      : null;

    if (selectedNode) {
      document.onkeypress = (ev: KeyboardEvent) => {
        if (ev.code === 'Delete') {
          this.handleDeleteSelectedNode();
        }
      };
    } else {
      document.onkeypress = null;
    }

    const inputs: Map<string, OutputSocketInformation> = node
      ? getInputInformation({ node, state: this.props })
      : new Map();

    return (
      <>
        <Row gutter={12}>
          <Col xs={24} md={12} xl={18}>
            <Card
              bordered={false}
              title={node ? node.type : 'Nothing selected'}
              style={{ marginBottom: 12 }}
            >
              <Row>
                {node && (
                  <Col xs={16}>
                    <h4>Properties</h4>
                    {renderFormItems ? (
                      <PropertiesForm
                        renderFormItems={renderFormItems}
                        handleSubmit={this.handleSave}
                        context={{ state: this.props, node }}
                        inputs={inputs}
                      />
                    ) : null}
                  </Col>
                )}
                <Col xs={8}>
                  <h4>Actions</h4>
                  {node && (
                    <AsyncButton
                      confirmMessage="Delete Node?"
                      icon="delete"
                      confirmClick
                      onClick={this.handleDeleteSelectedNode}
                    >
                      Delete Selected
                    </AsyncButton>
                  )}
                  <AsyncButton
                    icon="rocket"
                    onClick={this.handleStartCalulcation}
                  >
                    Calculate Outputs
                  </AsyncButton>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card bordered={false} title="Editor" style={{ marginBottom: 12 }}>
              <TreeSelect
                ref={this.selectNodeRef}
                allowClear
                showSearch
                filterTreeNode={filterTreeNode}
                treeData={nodeTypesTree}
                style={{ width: 200 }}
                placeholder="Add Node"
                onSelect={this.handleSelectCreateNode}
              />
            </Card>
          </Col>
        </Row>
        <div
          id={EXPLORER_CONTAINER}
          {...css({
            width: '100%',
            height: '800px',
            border: '1px solid #CCC',
            marginBottom: 12
          })}
        />
      </>
    );
  }
}
