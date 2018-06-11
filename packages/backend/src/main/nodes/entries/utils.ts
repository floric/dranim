import { ValueSchema } from '@masterthesis/shared';
import { Db } from 'mongodb';

import { addValueSchema } from '../../workspace/dataset';

export const copySchemas = (
  schemas: Array<ValueSchema>,
  newDsId: string,
  db: Db
) => Promise.all(schemas.map(s => addValueSchema(db, newDsId, s)));

export const getDynamicEntryContextInputs = async (
  inputDefs,
  inputs,
  db: Db
) => {
  if (!inputs.dataset || !inputs.dataset.isPresent) {
    return {};
  }

  const dynInputDefs = {};
  inputs.dataset.content.schema.forEach(s => {
    dynInputDefs[s.name] = {
      dataType: s.type,
      displayName: s.name,
      isDynamic: true
    };
  });

  return dynInputDefs;
};
