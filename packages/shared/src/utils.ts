import { FormValue } from './interfaces';

export const formToMap = (form: Array<FormValue>): Map<string, string> => {
  return new Map(form.map<[string, string]>(f => [f.name, f.value]));
};

export const getOrDefault = <T>(
  form: Map<string, string>,
  name: string,
  defaultVal: T
): T => {
  const existingVal = form.get(name);
  if (existingVal) {
    return JSON.parse(existingVal);
  } else {
    return defaultVal;
  }
};
