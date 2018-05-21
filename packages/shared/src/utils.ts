import { NodeInstance, FormValues } from './interfaces';

export const parseNodeForm = (node: NodeInstance): FormValues<any> => {
  const fullForm = {};
  Array.from(Object.entries(node.form)).forEach(e => {
    try {
      fullForm[e[0]] = JSON.parse(e[1].value);
    } catch (err) {
      console.error('Invalid value from server.');
      fullForm[e[0]] = null;
    }
  });

  return fullForm;
};
