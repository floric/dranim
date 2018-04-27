import * as D3NE from 'd3-node-editor';

import { datasetSocket } from '../sockets';
import { Dataset } from '../../utils/model';

export class DatasetInputComp extends D3NE.Component {
  constructor(datasets: Array<Dataset>) {
    super('Input Dataset', {
      builder(node: D3NE.Node) {
        const optionsVal = datasets.map(
          ds => `<option value="${ds.id}">${ds.name}</option>`
        );
        const outputDataset = new D3NE.Output('Dataset', datasetSocket);
        const selectDataset = new D3NE.Control(
          `<select>${optionsVal}</select>`,
          (element, control) => {
            console.log(element);
          }
        );
        return node.addControl(selectDataset).addOutput(outputDataset);
      },
      worker(node: D3NE.Node, inputs, outputs) {
        //
      }
    });
  }
}

export class SelectColumnComp extends D3NE.Component {
  constructor(datasets: Array<Dataset>) {
    super('Select Columns', {
      builder(node: D3NE.Node) {
        const optionsVal = datasets.map(
          ds =>
            `<label><input type="checkbox" name="zutat" value="${ds.id}">${
              ds.name
            }</label>`
        );
        const inputDataset = new D3NE.Input('Dataset', datasetSocket);
        const outputDataset = new D3NE.Output('Dataset', datasetSocket);
        const selectDataset = new D3NE.Control(
          `<form>${optionsVal}</form>`,
          (element, control) => {
            // set dataset
          }
        );
        return node
          .addInput(inputDataset)
          .addControl(selectDataset)
          .addOutput(outputDataset);
      },
      worker(node: D3NE.Node, inputs, outputs) {
        //
      }
    });
  }
}
