import { NodeInstance, FormValues } from './nodes';

export const parseNodeForm = (node: NodeInstance): FormValues<any> => {
  const fullForm = {};
  Array.from(Object.values(node.form)).forEach(e => {
    try {
      fullForm[e.name] = JSON.parse(e.value);
    } catch (err) {
      console.error('Invalid value from server.');
      fullForm[e.name] = null;
    }
  });

  return fullForm;
};
