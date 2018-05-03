import * as React from 'react';
import { Card, Row, Col, TreeSelect, Button } from 'antd';
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

  public render() {
    const { selectedNode, nodes } = this.state;

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
              title="Selected"
              style={{ marginBottom: 12 }}
            >
              {selectedNode ? (
                <>
                  <strong>Selected: </strong>
                  {nodes.find(n => n.id === selectedNode)!.type}
                  <Row>
                    <Col xs={8}>
                      <Button onClick={this.handleDeleteSelectedNode}>
                        Delete
                      </Button>
                    </Col>
                  </Row>
                </>
              ) : (
                'Nothing selected yet.'
              )}
            </Card>
          </Col>
          <Col xs={24} md={12} xl={6}>
            <Card bordered={false} title="Actions" style={{ marginBottom: 12 }}>
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
