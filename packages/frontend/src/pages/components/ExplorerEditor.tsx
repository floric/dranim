import * as React from 'react';
import * as D3NE from 'd3-node-editor';
import { css } from 'glamor';

import {
  DatasetInputComp,
  SelectColumnComp
} from '../../explorer/nodes/dataset';
import { Dataset } from '../../utils/model';

export interface ExplorerEditorProps {
  datasets: Array<Dataset>;
}

export class ExplorerEditor extends React.Component<ExplorerEditorProps> {
  public componentDidMount() {
    const { datasets } = this.props;

    const components = [
      new DatasetInputComp(datasets),
      new SelectColumnComp(datasets)
    ];
    const Nodes = {};
    components.forEach(c => {
      Nodes[c.name] = c;
    });

    const menu = new D3NE.ContextMenu({
      Actions: {},
      Nodes
    });

    const container = document.querySelector('#d3ne');
    if (!container) {
      return;
    }

    // tslint:disable-next-line:no-unused-expression
    const editor = new D3NE.NodeEditor(
      'demo@0.1.0',
      container as HTMLElement,
      components,
      menu
    );
    editor.eventListener.persistent = true;
    editor.eventListener.on('change', param => {
      console.log(editor.toJSON());
    });
  }

  public render() {
    return (
      <div
        id="d3ne"
        className="node-editor"
        {...css({ height: '800px', width: '100%', border: '1px solid #CCC' })}
      />
    );
  }
}
