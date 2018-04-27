import * as D3NE from 'd3-node-editor';

export const datasetSocket = new D3NE.Socket('dataset', 'Dataset', 'hint');
export const stringSocket = new D3NE.Socket('string', 'String', 'hint');
export const valueSchemaSocket = new D3NE.Socket(
  'valueschema',
  'Value Schema',
  'hint'
);
