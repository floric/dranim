import { FormValue, ConnectionDef } from '../ExplorerEditor';

export const getOrDefault = <T>(
  form: Array<FormValue>,
  name: string,
  defaultVal: T
): T => {
  const existingVal = form.find(f => f.name === 'value');
  if (existingVal) {
    return JSON.parse(existingVal.value);
  } else {
    return defaultVal;
  }
};

export const getInputNode = (
  socketName: string,
  nodeId: string,
  connections: Array<ConnectionDef>
) => {
  const inputs = connections.filter(
    n => n.to && n.to.nodeId === nodeId && n.to.name === socketName
  );
  if (inputs.length !== 1) {
    return null;
  }

  return inputs[0].from;
};

export const getOutputNodes = (
  socketName: string,
  nodeId: string,
  connections: Array<ConnectionDef>
) => {
  const outputs = connections.filter(
    n => n.from && n.from.nodeId === nodeId && n.from.name === socketName
  );
  if (outputs.length === 0) {
    return null;
  }

  return outputs.map(c => c.to).filter(n => n !== null);
};
