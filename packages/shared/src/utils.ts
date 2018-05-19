import { FormValues, FormValuesMap } from './interfaces';

export const formToMap = (form: FormValues): FormValuesMap => {
  return new Map(form.map<[string, string]>(f => [f.name, f.value]));
};

export const getOrDefault = <T>(
  form: FormValuesMap,
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
