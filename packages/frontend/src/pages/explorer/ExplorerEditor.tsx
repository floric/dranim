import * as React from 'react';
import { Card, Row, Col, TreeSelect } from 'antd';
import { css } from 'glamor';

import { Dataset } from '../../utils/model';
import { nodeTypes, nodeTypesTree } from './nodes/AllNodes';
import { EXPLORER_CONTAINER, updateStage } from './editor/EditorStage';
import { NODE_WIDTH } from './editor/Nodes';
import { OutputSocketInformation } from './nodes/Sockets';
import { getInputInformation } from './nodes/utils';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { PropertiesForm } from './editor/PropertiesForm';
import { AsyncButton } from '../../components/AsyncButton';

const filterTreeNode = (inputValue: string, treeNode: any) => {
  if (!treeNode.props.index) {
    return false;
  }

  return treeNode.props.index.includes(inputValue.toLocaleLowerCase());
};

export interface FormValue {
  name: string;
  value: string;
}

export interface NodeDef {
  type: string;
  x: number;
  y: number;
  id: string;
  form: Array<FormValue>;
}

export interface SocketDef {
  nodeId: string;
  name: string;
}

export interface ConnectionDef {
  id?: string; // local connections don't have an ID!
  from: SocketDef | null;
  to: SocketDef | null;
}

export interface ExplorerEditorProps {
  connections: Array<ConnectionDef>;
  nodes: Array<NodeDef>;
  datasets: Array<Dataset>;
  onNodeCreate: (type: string, x: number, y: number) => Promise<void>;
  onNodeDelete: (id: string) => Promise<void>;
  onNodeUpdate: (id: string, x: number, y: number) => Promise<void>;
  onConnectionCreate: (from: SocketDef, to: SocketDef) => Promise<void>;
  onConnectionDelete: (id: string) => Promise<void>;
  onAddOrUpdateFormValue: (
    nodeId: string,
    name: string,
    value: string
  ) => Promise<void>;
}

export interface OpenConnection {
  dataType: string;
  inputs: null | Array<SocketDef>;
  outputs: null | Array<SocketDef>;
}

export interface ExplorerEditorState {
  openConnection: OpenConnection | null;
  selectedNode: string | null;
}

export class ExplorerEditor extends React.Component<
  ExplorerEditorProps,
  ExplorerEditorState
> {
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
    this.setState({ selectedNode: null });
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
    const ValueForm = node
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
        <Row gutter={8}>
          <Col xs={24} md={12} xl={18}>
            <Card
              bordered={false}
              title={node ? node.type : 'Nothing selected'}
              style={{ marginBottom: 12 }}
            >
              {node ? (
                <Row>
                  <Col xs={16}>
                    <h4>Properties</h4>
                    {node && ValueForm ? (
                      <PropertiesForm
                        RenderFormItems={ValueForm}
                        handleSubmit={this.handleSave}
                        context={{ state: this.props, node }}
                        inputs={inputs}
                      />
                    ) : null}
                  </Col>
                  <Col xs={8}>
                    <h4>Actions</h4>
                    <AsyncButton
                      icon="delete"
                      onClick={this.handleDeleteSelectedNode}
                    >
                      Delete
                    </AsyncButton>
                  </Col>
                </Row>
              ) : (
                'Select a node first.'
              )}
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card bordered={false} title="Editor" style={{ marginBottom: 12 }}>
              <TreeSelect
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
