const sleepPromise = require('sleep-promise');

import {
  FormValues,
  NodeDef,
  NodeInstance,
  NodeWithContextFnDef
} from './nodes';

export const parseNodeForm = (node: NodeInstance): FormValues<any> => {
  const fullForm = {};
  Array.from(Object.values(node.form)).forEach(e => {
    if (fullForm[e.name] !== undefined) {
      throw new Error(`Duplicate form value names: ${e.name}`);
    }

    try {
      fullForm[e.name] = JSON.parse(e.value);
    } catch (err) {
      fullForm[e.name] = null;
      console.error('Invalid value from server.');
    }
  });

  return fullForm;
};

export const hasContextFn = (
  n: NodeDef | NodeWithContextFnDef
): n is NodeWithContextFnDef => {
  return (n as NodeWithContextFnDef).contextFn !== undefined;
};

export const isNumeric = (n: any) => !isNaN(parseFloat(n)) && isFinite(n);

export const sleep = (ms: number): Promise<void> => sleepPromise(ms);
