import { FormValue } from '../pages/workspaces/explorer/ExplorerEditor';

export const getOrDefault = <T>(
  form: Array<FormValue>,
  name: string,
  defaultVal: T
): T => {
  const existingVal = form.find(f => f.name === name);
  if (existingVal) {
    return JSON.parse(existingVal.value);
  } else {
    return defaultVal;
  }
};
