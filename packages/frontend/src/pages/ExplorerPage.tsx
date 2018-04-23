import * as React from 'react';
import * as D3NE from 'd3-node-editor';

import { withPageHeaderHoC } from '../components/PageHeaderHoC';
import { css } from 'glamor';

class ExplorerPage extends React.Component<{}, {}> {
  public componentDidMount() {
    const datasetSocket = new D3NE.Socket('dataset', 'Dataset', 'hint');
    const idSocket = new D3NE.Socket('string', 'Value', 'hint');

    const datasetComp = new D3NE.Component('Dataset', {
      builder(node) {
        const out = new D3NE.Output('Name', datasetSocket);
        const numControl = new D3NE.Control(
          '<input type="text">',
          (element, control) => {
            control.putData('dataset', 1);
          }
        );

        return node.addControl(numControl).addOutput(out);
      },
      worker(node, inputs, outputs) {
        outputs[0] = node.data.num;
      }
    });

    const strComp = new D3NE.Component('String', {
      builder(node) {
        const out = new D3NE.Output('Value', idSocket);
        const numControl = new D3NE.Control(
          '<input type="text">',
          (element, control) => {
            control.putData('name', 1);
          }
        );

        return node.addControl(numControl).addOutput(out);
      },
      worker(node, inputs, outputs) {
        outputs[0] = node.data.num;
      }
    });

    const combineComp = new D3NE.Component('Combine', {
      builder(node) {
        const a = new D3NE.Input('Dataset A', datasetSocket);
        const b = new D3NE.Input('Dataset B', datasetSocket);
        const c = new D3NE.Input('Column name A', idSocket);
        const d = new D3NE.Input('Column name B', idSocket);

        const out = new D3NE.Output('Dataset', datasetSocket);
        return node
          .addInput(a)
          .addInput(c)
          .addInput(b)
          .addInput(d)
          .addOutput(out);
      },
      worker(node, inputs, outputs) {
        // a
      }
    });

    const aggregateComp = new D3NE.Component('Aggregate', {
      builder(node) {
        const a = new D3NE.Input('Dataset', datasetSocket);
        const out = new D3NE.Output('List of entries', datasetSocket);
        const timeControl = new D3NE.Control(
          `<select>
          <option value="volvo">Yearly</option>
          <option value="saab">Monthly</option>
          <option value="custom">Custom</option>
        </select>`,
          (element, control) => {
            control.putData('name', 1);
          }
        );
        return node
          .addInput(a)
          .addControl(timeControl)
          .addOutput(out);
      },
      worker(node, inputs, outputs) {
        // a
      }
    });

    const outputComp = new D3NE.Component('Output', {
      builder(node) {
        const a = new D3NE.Input('List of entries', datasetSocket);
        return node.addInput(a);
      },
      worker(node, inputs, outputs) {
        // a
      }
    });

    const components = [
      datasetComp,
      combineComp,
      strComp,
      aggregateComp,
      outputComp
    ];

    const menu = new D3NE.ContextMenu({
      Actions: {
        Action: () => {
          alert('Subitem selected');
        }
      },
      Nodes: {
        Dataset: datasetComp
      }
    });

    const container = document.querySelector('#d3ne');
    if (!container) {
      return;
    }

    const editor = new D3NE.NodeEditor(
      'demo@0.1.0',
      container as HTMLElement,
      components,
      menu
    );

    const n1 = datasetComp.builder(datasetComp.newNode());
    const n2 = datasetComp.builder(datasetComp.newNode());
    const nColumn1 = strComp.builder(strComp.newNode());
    const nColumn2 = strComp.builder(strComp.newNode());
    const add = combineComp.builder(combineComp.newNode());
    const agg = aggregateComp.builder(aggregateComp.newNode());
    const o = outputComp.builder(outputComp.newNode());

    n1.position = [80, 200];
    n2.position = [80, 400];
    add.position = [500, 240];

    editor.connect(n1.outputs[0], add.inputs[0]);
    editor.connect(n2.outputs[0], add.inputs[1]);

    editor.addNode(n1);
    editor.addNode(n2);
    editor.addNode(nColumn1);
    editor.addNode(nColumn2);
    editor.addNode(add);
    editor.addNode(agg);
    editor.addNode(o);
  }

  public render() {
    return (
      <div
        id="d3ne"
        className="node-editor"
        {...css({ height: '800px', width: '100%' })}
      />
    );
  }
}

export default withPageHeaderHoC({ title: 'Explorer', includeInCard: false })(
  ExplorerPage
);
