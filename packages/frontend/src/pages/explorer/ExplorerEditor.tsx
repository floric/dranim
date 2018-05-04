import * as React from 'react';
import { Card, Row, Col, TreeSelect, Button, Form } from 'antd';
import { css } from 'glamor';
import * as uuid from 'uuid/v4';

import { Dataset } from '../../utils/model';
import { nodeTypes, nodeTypesTree } from './nodes/AllNodes';
import { NODE_WIDTH, EXPLORER_CONTAINER, updateStage } from './EditorStage';

const filterTreeNode = (inputValue: string, treeNode: any) => {
  if (!treeNode.props.index) {
    return false;
  }

  return treeNode.props.index.includes(inputValue.toLocaleLowerCase());
};

export interface NodeDef {
  type: string;
  x: number;
  y: number;
  id: string;
}

export interface ConnectionDef {
  from: { nodeId: string; socketName: string } | null;
  to: { nodeId: string; socketName: string } | null;
}

export interface ExplorerEditorProps {
  datasets: Array<Dataset>;
  nodes: Array<NodeDef>;
  connections: Array<ConnectionDef>;
}

export interface ExplorerEditorState {
  connections: Array<ConnectionDef>;
  nodes: Array<NodeDef>;
  mode: 'DEFAULT';
  openConnection: { dataType: string } | null;
  selectedNode: string | null;
}

const isInvalidForSave = f =>
  f.errors !== undefined || f.validating === true || f.dirty === true;

export class ExplorerEditor extends React.Component<
  ExplorerEditorProps,
  ExplorerEditorState
> {
  public componentWillMount() {
    const { connections, nodes } = this.props;
    this.setState({
      openConnection: null,
      selectedNode: null,
      mode: 'DEFAULT',
      connections,
      nodes
    });
  }

  private changeState = (newState: ExplorerEditorState) => {
    this.setState(newState);
  };

  public componentDidUpdate() {
    this.updateCanvas();
  }

  public updateCanvas() {
    updateStage(EXPLORER_CONTAINER, this.state, this.changeState);
  }

  private handleCreateNode = (type: string) => {
    if (!nodeTypes.has(type)) {
      return;
    }

    const newId = uuid();
    const canvas = document.getElementById(EXPLORER_CONTAINER);
    const x = canvas ? canvas.clientWidth / 2 - NODE_WIDTH / 2 : 50;
    const y = canvas ? canvas.clientHeight / 2 : 50;
    this.setState({
      selectedNode: newId,
      nodes: [...this.state.nodes, { id: newId, x, y, type }]
    });
  };

  private handleDeleteSelectedNode = () => {
    const { connections, nodes, selectedNode } = this.state;
    const nodeId = selectedNode;
    if (selectedNode === null) {
      return;
    }

    this.setState({
      nodes: nodes.filter(n => n.id !== nodeId),
      selectedNode: null,
      connections: connections.filter(
        c =>
          c.to !== null &&
          c.to.nodeId !== nodeId &&
          c.from !== null &&
          c.from.nodeId !== nodeId
      )
    });
  };

  private onPropertiesFieldChange = (nodeId: string, field: any) => {
    const changedNames = Object.keys(field);
    const errorsOrValidatingOpen =
      changedNames.map(fieldName => field[fieldName]).filter(isInvalidForSave)
        .length > 0;
    if (errorsOrValidatingOpen) {
      return;
    }

    changedNames.forEach(fieldName =>
      console.log(
        `Save ${fieldName} in ${nodeId} with ${JSON.stringify(field)}`
      )
    );
  };

  public render() {
    const { selectedNode, nodes } = this.state;

    const node = selectedNode ? nodes.find(n => n.id === selectedNode) : null;
    const ValueForm = node ? nodeTypes.get(node.type)!.form || null : null;
    const FormImpl =
      ValueForm && node
        ? Form.create({
            onFieldsChange: (props, fields) =>
              this.onPropertiesFieldChange(node.id, fields)
          })(ValueForm)
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

    return (
      <>
        <div
          id={EXPLORER_CONTAINER}
          {...css({
            width: '100%',
            height: '800px',
            border: '1px solid #CCC',
            marginBottom: 12
          })}
        />
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
                    {FormImpl ? (
                      <>
                        <h4>Properties</h4>
                        <FormImpl />
                      </>
                    ) : null}
                  </Col>
                  <Col xs={8}>
                    <h4>Actions</h4>
                    <Button
                      icon="delete"
                      onClick={this.handleDeleteSelectedNode}
                    >
                      Delete
                    </Button>
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
                onSelect={this.handleCreateNode}
              />
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
