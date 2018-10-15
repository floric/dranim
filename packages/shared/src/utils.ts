import { FormValues, ServerNodeDef, ServerNodeDefWithContextFn } from './nodes';
import { SocketMetaDef } from './sockets';

export const parseNodeForm = (form: {
  [key: string]: string;
}): FormValues<any> => {
  const fullForm = {};
  Object.entries(form).forEach(e => {
    if (fullForm[e[0]] !== undefined) {
      throw new Error(`Duplicate form value names: ${e[0]}`);
    }

    try {
      fullForm[e[0]] = JSON.parse(e[1]);
    } catch (err) {
      fullForm[e[0]] = null;
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
