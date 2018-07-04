import { ConnectionInstance, FormValues } from '@masterthesis/shared';

export const getInputNode = (
  socketName: string,
  nodeId: string,
  connections: Array<ConnectionInstance>
) => {
  const inputs = connections.filter(
    n => n.to && n.to.nodeId === nodeId && n.to.name === socketName
  );
  if (inputs.length !== 1) {
    return null;
  }

  return inputs[0].from;
};

export const getValueOrDefault = <T, Name extends keyof T>(
  form: FormValues<T>,
  valueName: Name,
  defaultVal: FormValues<T>[Name]
) => {
  return form[valueName] != null ? form[valueName] : defaultVal;
};
