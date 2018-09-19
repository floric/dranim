import {
  FormValue,
  FormValues,
  ServerNodeDef,
  ServerNodeDefWithContextFn
} from './nodes';
import { SocketMetaDef } from './sockets';

export const parseNodeForm = (form: Array<FormValue>): FormValues<any> => {
  const fullForm = {};
  Array.from(Object.values(form)).forEach(e => {
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

export const isNumeric = (n: any) => !isNaN(parseFloat(n)) && isFinite(n);

export const sleep = (ms: number) =>
  new Promise<void>(resolve => setInterval(resolve, ms));

export const hasContextFn = (
  nodeDef: ServerNodeDef | ServerNodeDefWithContextFn
): nodeDef is ServerNodeDefWithContextFn =>
  (nodeDef as ServerNodeDefWithContextFn)
    .transformInputDefsToContextInputDefs !== undefined;

export const allAreDefinedAndPresent = (inputs: {
  [name: string]: SocketMetaDef<any>;
}) =>
  Object.values(inputs)
    .map(i => i != null && i.isPresent === true)
    .reduce((a, b) => a && b, true);
